# Guía de despliegue — MEGATAE eSIM

Stack de producción: **Railway** (API + PostgreSQL) · **Vercel** (Frontend) · **Cloudflare R2** (Archivos)

---

## 1. Prerequisito — Repositorio en GitHub

Sube el monorepo a GitHub (o GitLab). Railway y Vercel se conectan al repositorio para
hacer deploy automático en cada push a `main`.

```bash
git remote add origin https://github.com/tu-usuario/megatae-esim.git
git push -u origin main
```

---

## 2. Base de datos — PostgreSQL en Railway

1. Entra a [railway.app](https://railway.app) → New Project → **Add PostgreSQL**.
2. Una vez creado, copia la variable `DATABASE_URL` desde la pestaña **Variables** del
   servicio PostgreSQL. La necesitarás en el paso 3.

---

## 3. API — Deploy en Railway

1. En el mismo proyecto de Railway → **New Service → GitHub Repo**.
2. Selecciona tu repositorio. Railway detecta el `railway.toml` en la raíz y usa:
   - Build: `pnpm install --frozen-lockfile && pnpm --filter api build`
   - Start: `pnpm --filter api db:migrate:deploy && pnpm --filter api start`
   - Health check: `GET /api/health`
3. En la pestaña **Variables** del servicio API, agrega:

```
DATABASE_URL          = (pegar desde servicio PostgreSQL)
NODE_ENV              = production
LOG_LEVEL             = info
PORT                  = 3001
WEB_URL               = https://tuapp.vercel.app   ← actualizar después del paso 4
JWT_SECRET            = (string aleatorio seguro — openssl rand -hex 64)
JWT_EXPIRES_IN        = 8h
RESEND_API_KEY        = re_...
EMAIL_FROM            = no-reply@megatae.mx
R2_ACCOUNT_ID         = (tu account ID de Cloudflare)
R2_ACCESS_KEY_ID      = (tu API token Key ID)
R2_SECRET_ACCESS_KEY  = (tu API token Secret)
R2_BUCKET_NAME        = megatae-esim
R2_PUBLIC_URL         = https://pub-xxx.r2.dev   ← o archivos.megatae.mx cuando tengas el dominio
VIDEO_TUTORIAL_URL    = (opcional)
```

4. Railway hará el primer deploy. Las migraciones de Prisma corren automáticamente antes
   de iniciar el servidor.
5. Después del deploy, Railway te da una URL pública (ej. `megatae-api.up.railway.app`).
   Cópiala — la necesitarás en el paso 4.

### Seed inicial

La primera vez, ejecuta el seed desde tu máquina local (con `DATABASE_URL` de producción):

```bash
DATABASE_URL="postgresql://..." pnpm db:seed
```

---

## 4. Frontend — Deploy en Vercel

1. Entra a [vercel.com](https://vercel.com) → New Project → importa tu repositorio.
2. En **Configure Project**:
   - **Root Directory:** `apps/web`
   - **Build Command:** `pnpm build` (auto-detectado)
   - **Output Directory:** `dist`
3. En **Environment Variables** agrega:

```
VITE_API_URL = https://megatae-api.up.railway.app
```

   (la URL de Railway del paso 3, sin `/api` al final, sin barra al final)

4. Deploy. Vercel te da una URL (ej. `megatae-esim.vercel.app`).
5. Vuelve a Railway → servicio API → Variables → actualiza `WEB_URL` con esa URL.
   Railway hace redeploy automático.

---

## 5. Cloudflare R2 — CORS para producción

El browser sube archivos directamente a R2. R2 necesita permitir el dominio de Vercel.

En el dashboard de Cloudflare → R2 → `megatae-esim` → **Settings → CORS Policy**,
agrega la URL de Vercel junto a `localhost`:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://megatae-esim.vercel.app"
    ],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

Cuando configures un dominio custom (ej. `megatae.mx`), agrégalo aquí también.

---

## 6. Dominio custom (opcional)

### Frontend (`megatae.mx`)
1. En Vercel → tu proyecto → **Settings → Domains** → agrega `megatae.mx`.
2. Agrega el registro DNS que Vercel indica en tu proveedor de dominio.
3. Actualiza en Railway: `WEB_URL=https://megatae.mx`.
4. Actualiza en R2 CORS: agrega `https://megatae.mx`.

### Archivos (`archivos.megatae.mx`)
1. En Cloudflare → R2 → `megatae-esim` → **Settings → Custom Domains** → agrega
   `archivos.megatae.mx`.
2. Cloudflare configura el DNS automáticamente (funciona solo si el dominio está en Cloudflare).
3. Actualiza en Railway: `R2_PUBLIC_URL=https://archivos.megatae.mx`.
4. Haz redeploy en Railway para que la variable tome efecto.

---

## 7. Checklist post-deploy

- [ ] `GET https://megatae-api.up.railway.app/api/health` responde `{ status: "ok" }`
- [ ] La landing carga planes desde la BD
- [ ] Flujo de compra completo: datos → pago → upload comprobante → gracias
- [ ] Login admin funciona con las credenciales del seed
- [ ] Cola de solicitudes muestra la solicitud recién creada
- [ ] Validación de pago → correo PagoRechazado llega al email
- [ ] Subida de QR → correo QrEnviado llega con imagen y DN
- [ ] Configuración admin: crear/editar plan, toggle activo se refleja en la landing

---

## 8. Mantenimiento

### Agregar o cambiar planes
Panel admin → Configuración → Planes. No requiere deploy.

### Agregar cuentas bancarias
Panel admin → Configuración → Cuentas bancarias. No requiere deploy.

### Agregar un admin nuevo
Directo en la BD o via Prisma Studio:
```bash
# Generar hash de contraseña (Node REPL)
node -e "const b = require('bcryptjs'); b.hash('nueva_clave', 12).then(console.log)"

# Insertar en tabla Admin con el hash resultante
```

### Migraciones futuras
Cualquier cambio al schema:
```bash
pnpm --filter api db:migrate  # genera migration en dev
git push origin main           # Railway aplica con prisma migrate deploy al hacer deploy
```

---

## 9. Extensión a Fase 2 (módulo de rifa)

La tabla `Boleto` se agrega sin modificar el modelo existente:

```prisma
model Boleto {
  id          Int       @id @default(autoincrement())
  solicitudId Int       @unique
  solicitud   Solicitud @relation(fields: [solicitudId], references: [id])
  numero      String    @unique
  validadoLMTR Boolean  @default(false)
  createdAt   DateTime  @default(now())
}
```

El gate de validación LMTR se calcula desde `HistorialEstado`: si existe una entrada
con `estadoNuevo = "ACTIVADA"` y `createdAt` dentro de las 24h del `QR_ENVIADO`,
la venta es elegible para el sorteo.

El `SiredAdapter` ya está en su propio archivo — cuando llegue la API real de SIRED,
solo se implementa `RealSiredAdapter` y se swapea la instancia en `sired.ts`.

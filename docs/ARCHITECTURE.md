# MEGATAE eSIM — Arquitectura del sistema

> Documento actualizado el 2026-11-12 para reflejar el código real del
> repositorio. Sustituye a la versión de Fase 2 + addendum de Stripe. Las
> diferencias con la versión anterior están listadas al final, en
> "Cambios respecto a la versión anterior".
>
> 2026-11-16: se agrega el diseño del módulo **Registro de negocios para
> recargas** (sección 17).
>
> 2026-11-17: módulo de recargas **implementado** (base de datos, formulario
> público y panel admin). La sección 17 describe lo que está en el código.

## 1. Diagrama de sistema

```
[Cliente]                         [Mesa de control: PRO / GENERAL / RECARGAS]
    |                                              |
    v                                              v
[React SPA — Vite + Tailwind]  (Vercel)
  Sitio público
    /                          Landing principal
    /comprar                   Datos + pago en una sola pantalla
    /gracias                   Confirmación (state o ?token= de Stripe)
    /consultar                 Consulta de estado por folio + correo
    /v1/eSIM-{Att|Movistar|Bait}            Landings por compañía
    /v1/eSIM-{Att|Movistar|Bait}/comprar    Compra con branding de compañía
    /conocenos, /vende-recargas, /registro  Páginas informativas
    /registro-negocio          (módulo recargas) Alta de negocio + transferencia
  Panel admin (JWT)
    /admin/login, /admin, /admin/solicitudes, /admin/solicitudes/:id,
    /admin/configuracion, /admin/reportes
    /admin/registros-recargas[/:id]         (módulo recargas)
    |
    | HTTP / REST JSON
    v
[Node.js + Express]  (Railway)
  Rutas públicas (rate limit)   planes, cuentas, leads, solicitudes, consulta
  Webhook Stripe                firma de Stripe, montado antes de express.json()
  Rutas admin (JWT + rol)       cola, transiciones, QR, recordatorio,
                                planes, cuentas, reportes,
                                registros-recargas (módulo recargas)
    |
    v
[PostgreSQL — Prisma ORM]  (Railway)

Servicios externos
  [Cloudflare R2]  comprobantes y QRs (presigned URL, subida directa del navegador)
  [Resend]         6 correos transaccionales (React Email)
  [Stripe]         Checkout hospedado, solo tarjeta
  [SIRED]          adaptador con implementación stub
```

## 2. Stack tecnológico

| Capa | Tecnología | Razón |
|---|---|---|
| Frontend | React + Vite + Tailwind | Mismo patrón que Rifadísimos |
| Routing | React Router v6 | Estándar para SPAs |
| Server state | TanStack React Query | Loading/error/refetch limpios en la cola del admin |
| Backend | Node.js + Express | Consistente con Rifadísimos |
| Validación | zod | Esquemas de entrada en cada endpoint y validación de entorno al arranque |
| ORM | Prisma | Type-safe, migraciones declarativas |
| BD | PostgreSQL | Consultas de cola por estado triviales |
| Archivos | Cloudflare R2 | Sin egress fee, API compatible con S3 |
| Email | Resend + React Email | Templates en JSX |
| Pagos | Stripe Checkout | Hospedado (PCI SAQ A), sin datos de tarjeta en el servidor |
| Auth | JWT (8h) + bcrypt | Sin servicio externo; suficiente para pocos admins |
| Logs | pino + pino-http | Logs estructurados |
| Pruebas | vitest + supertest | Suite del webhook de Stripe |
| Deploy | Vercel (web), Railway (API + Postgres) | Ver `docs/DEPLOY.md` |

## 3. Estructura de carpetas

```
megatae-master/
├── apps/
│   ├── web/                          # React + Vite
│   │   └── src/
│   │       ├── App.tsx               # Todas las rutas
│   │       ├── pages/
│   │       │   ├── landing/          # Landing principal + secciones
│   │       │   │   ├── att/v1/       # Landing y compra con branding AT&T
│   │       │   │   ├── bait/v1/      # Idem Bait
│   │       │   │   └── movistar/v1/  # Idem Movistar
│   │       │   ├── compra/           # Comprar, PagoSeccion, Gracias, Consultar
│   │       │   ├── conocenos/        # Página informativa + formulario de soporte
│   │       │   ├── recargas/         # "Vende recargas"
│   │       │   ├── vinculacion/      # "Registro"
│   │       │   └── admin/            # Login, Dashboard, Solicitudes,
│   │       │                         # SolicitudDetalle, Configuracion, Reportes
│   │       ├── components/           # Navbar, Footer, Stepper, AdminLayout, ...
│   │       └── lib/                  # api, auth, features (flags), routes, analytics
│   └── api/                          # Node + Express
│       └── src/
│           ├── index.ts              # Montaje de middleware y rutas
│           ├── routes/
│           │   ├── planes.ts, cuentas.ts, leads.ts, auth.ts
│           │   ├── solicitudes.ts    # Transferencia, Stripe checkout/cancelar,
│           │   │                     # by-token, consultar
│           │   ├── stripeWebhook.ts (+ .test.ts)
│           │   └── admin/            # solicitudes, planes, cuentas, reportes
│           ├── middleware/auth.ts    # requireAuth, requirePro
│           ├── lib/                  # env, logger, prisma, tokens, transitions
│           ├── services/             # email, r2, stripe, sired
│           ├── emails/               # 6 templates React Email
│           └── prisma/               # schema, migraciones, seed, backfill
└── package.json                      # pnpm workspaces
```

## 4. Modelo de datos (Prisma)

```prisma
enum Compania        { ATT MOVISTAR BAIT }
enum RolAdmin        { PRO GENERAL RECARGAS }
enum MetodoPago      { TRANSFERENCIA STRIPE }
enum EstadoSolicitud {
  RECIBIDA REVISION_PAGO PAGO_RECHAZADO PAGO_VALIDADO
  EN_ACTIVACION QR_ENVIADO ACTIVADA CANCELADA
}

model Plan {
  id          Int      @id @default(autoincrement())
  compania    Compania
  precio      Decimal  @db.Decimal(10, 2)
  recarga     Decimal  @db.Decimal(10, 2)
  megas       Int?                       // GB del plan, para mostrar en tarjetas
  dias        Int?                       // vigencia
  descripcion String?
  activo      Boolean  @default(true)
  destacado   Boolean  @default(false)   // resalta la tarjeta en la landing
  createdAt   DateTime @default(now())
  solicitudes Solicitud[]
}

model Solicitud {
  id                   Int             @id @default(autoincrement()) // solo rutas admin
  publicCode           String          @unique  // folio público "MT-XXXXXXXXXX"
  nombre               String
  email                String
  telefono             String?                  // opcional desde 2026-08-12
  ciudad               String?                  // solo AT&T
  estadoMx             String?                  // estado de la República, solo AT&T
  lada                 String?                  // elegida (AT&T) o "55" (Movistar/Bait)
  compania             Compania
  planId               Int
  plan                 Plan            @relation(fields: [planId], references: [id])
  comprobante          String?                  // requerido por zod si es TRANSFERENCIA
  metodoPago           MetodoPago      @default(TRANSFERENCIA)
  estado               EstadoSolicitud @default(RECIBIDA)
  observacion          String?
  qrUrl                String?
  dn                   String?
  // Solo flujo Stripe
  precioCotizado       Int?                     // centavos, congelado al crear el checkout
  stripeSessionId      String?         @unique  // correlación, no marca de éxito
  accessToken          String?         @unique  // 32 bytes, solo para /gracias
  accessTokenExpiresAt DateTime?                // createdAt + 48h
  ip                   String?                  // evidencia de contracargo
  userAgent            String?                  // evidencia de contracargo
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt
  historial            HistorialEstado[]
}

model HistorialEstado {
  id             Int             @id @default(autoincrement())
  solicitudId    Int
  estadoAnterior EstadoSolicitud
  estadoNuevo    EstadoSolicitud
  adminId        Int?            // null = transición de sistema (Stripe)
  observacion    String?
  createdAt      DateTime        @default(now())
}

model StripeEvent {                // idempotencia del webhook
  id          String    @id        // event.id de Stripe
  type        String
  processedAt DateTime?            // null = no terminó de procesarse
  createdAt   DateTime  @default(now())
}

model CuentaBancaria { id, banco, titular, cuenta?, clabe?, activo, orden }
model Lead           { id, email, aceptoTerminos, createdAt }   // sin relación con Solicitud
model Admin          { id, email @unique, passwordHash, nombre, rol, activo, createdAt }
```

Migraciones aplicadas, en orden: `init`, `add_plan_destacado`,
`add_megas_dias_to_plan`, `add_recargas_rol`, `make_telefono_optional`,
`add_stripe_payment`, `add_public_code_not_null` (esta última requiere correr
`pnpm db:backfill-public-code` antes; ver incidente del 2026-09-07 en
`PROGRESS.md`).

## 5. Roles

| Rol | Cuántos | Qué hace |
|---|---|---|
| PRO | 1 (dueña) | Todo: cola completa, configuración de planes y cuentas, reportes de todos los estados |
| GENERAL | 3 | Valida pagos, activa, sube QR/DN. Ve en la UI los estados RECIBIDA a EN_ACTIVACION |
| RECARGAS | según seed | Seguimiento posterior al QR. Ve en la UI QR_ENVIADO y ACTIVADA. Atiende los registros de negocios para recargas (módulo recargas, junto con PRO) |

La escritura de planes y cuentas bancarias está protegida en el backend con
`requirePro`. **La restricción de estados por rol (GENERAL / RECARGAS) solo
existe en el frontend y en el reporte Excel**; ver sección 13.

## 6. Máquina de estados

Transiciones manuales permitidas (`lib/transitions.ts`, `TRANSICIONES_VALIDAS`):

```
RECIBIDA        → REVISION_PAGO
REVISION_PAGO   → PAGO_VALIDADO | PAGO_RECHAZADO
PAGO_RECHAZADO  → CANCELADA
PAGO_VALIDADO   → EN_ACTIVACION
EN_ACTIVACION   → QR_ENVIADO          (solo vía POST /:id/qr)
QR_ENVIADO      → ACTIVADA | CANCELADA
ACTIVADA, CANCELADA: estados finales
```

`PATCH /api/admin/solicitudes/:id/estado` consulta el mapa; cualquier otra
transición responde 422.

Transiciones de sistema (no pasan por el mapa):

- Webhook Stripe pagado y con monto correcto: `RECIBIDA → PAGO_VALIDADO`.
- Webhook `checkout.session.expired` (30 min): `RECIBIDA → CANCELADA`.
- `POST /api/solicitudes/stripe/cancelar` (el cliente cancela en Stripe):
  `RECIBIDA → CANCELADA`, con lock de fila; nunca revierte un `PAGO_VALIDADO`.

Efectos secundarios de las transiciones:

- `→ PAGO_RECHAZADO`: correo PagoRechazado con la observación.
- `→ QR_ENVIADO`: correo QrEnviado.
- `→ ACTIVADA` con DN: `siredAdapter.reportarVenta()` en fire-and-forget.

La cancelación de un `PAGO_RECHAZADO` a las 24 h **es manual**: no hay tarea
programada (ver sección 13).

## 7. Flujo de compra

1. El cliente entra por `/comprar` o por la landing de una compañía
   (`/v1/eSIM-*/comprar`).
2. Llena datos, compañía, plan y LADA (solo AT&T). En cuanto los campos son
   válidos aparece la sección de pago en la misma pantalla
   (`PagoSeccion.tsx`), con un resumen de la compra.
3. Dos caminos:
   - **Tarjeta (Stripe):** `POST /api/solicitudes/stripe/checkout` → redirect a
     Stripe → `/gracias?token=...`, que hace polling a `by-token` (5 intentos,
     1.5 s) porque el redirect puede llegar antes que el webhook.
   - **Transferencia** (oculta hoy con `VITE_TRANSFERENCIA_HABILITADA=false`):
     cuentas bancarias → upload del comprobante a R2 → `POST /api/solicitudes`
     → `/gracias` con `location.state`.
4. Si el cliente cancela en Stripe, vuelve a `/comprar?stripe=cancelado&token=...`
   y la solicitud se cancela al momento. Para reintentar llena el formulario de
   nuevo (decisión de producto).
5. Seguimiento posterior: `/consultar` con folio + correo.

## 8. Endpoints

### Públicos

| Método | Ruta | Límite | Descripción |
|---|---|---|---|
| GET | /api/health | — | Health check |
| GET | /api/planes | — | Planes activos |
| GET | /api/cuentas-bancarias | — | Cuentas activas ordenadas |
| POST | /api/leads | 20 / 15 min | Email del lead magnet |
| POST | /api/solicitudes/presigned-url | 20 / 15 min | URL firmada para el comprobante |
| POST | /api/solicitudes | 20 / 15 min | Crea solicitud por transferencia |
| POST | /api/solicitudes/stripe/checkout | 20 / 15 min | Crea solicitud + Checkout Session; regresa `{ url }` |
| POST | /api/solicitudes/stripe/cancelar | 20 / 15 min | Cancela al volver de Stripe; idempotente y silencioso |
| GET | /api/solicitudes/by-token/:accessToken | 20 / 15 min | Solo para `/gracias`; respuesta genérica si no existe o expiró |
| POST | /api/solicitudes/consultar | 20 / 15 min | `{ folio, email }`; acepta `MT-...` o id numérico antiguo |
| POST | /api/stripe/webhook | firma Stripe | Ver sección 10 |
| POST | /api/auth/login | 10 / 15 min | bcrypt + JWT 8h |

### Admin (JWT requerido en todo `/api/admin/*`)

| Método | Ruta | Rol en backend | Descripción |
|---|---|---|---|
| GET | /api/admin/solicitudes?estado=X | cualquiera | Cola filtrada por estado |
| GET | /api/admin/solicitudes/:id | cualquiera | Detalle con historial |
| PATCH | /api/admin/solicitudes/:id/estado | cualquiera | Transición manual validada |
| POST | /api/admin/solicitudes/:id/qr/presigned-url | cualquiera | URL firmada del QR (JPG/PNG, estado EN_ACTIVACION) |
| POST | /api/admin/solicitudes/:id/qr | cualquiera | Guarda QR + DN, pasa a QR_ENVIADO, manda correo |
| POST | /api/admin/solicitudes/:id/recordatorio | cualquiera | Reenvía recordatorio de activación (solo QR_ENVIADO) |
| GET | /api/admin/planes | cualquiera | Todos los planes |
| POST, PATCH | /api/admin/planes[/:id] | PRO | Crear / editar plan |
| GET | /api/admin/cuentas-bancarias | cualquiera | Todas las cuentas |
| POST, PATCH | /api/admin/cuentas-bancarias[/:id] | PRO | Crear / editar cuenta |
| POST | /api/admin/cuentas-bancarias/reorder | PRO | Reordenar cuentas |
| GET | /api/admin/reportes/solicitudes.xlsx | filtrado por rol | Reporte Excel (incluye método de pago) |

## 9. Archivos (presigned URL)

1. El frontend pide una URL firmada a la API (expira en 10 min).
2. El navegador sube el archivo directo a R2, sin pasar por Express.
3. El frontend manda la URL resultante a la API junto con el resto de datos.

Aplica igual al comprobante del cliente y al QR que sube el admin. Límite de
5 MB validado en el cliente. Los archivos huérfanos se limpian con una regla
de lifecycle del bucket.

## 10. Stripe

**Decisiones**

- Es un método adicional a la transferencia, solo con tarjeta
  (`payment_method_types: ['card']`). OXXO y SPEI serían una iteración aparte
  porque son asíncronos.
- La solicitud se crea en `RECIBIDA` **antes** del redirect; el webhook solo
  transiciona una fila existente. `metadata` lleva solo `solicitudId`, sin PII.
- El único dato del cliente que decide el cobro es `planId`; el precio se
  resuelve en el servidor y se congela en `precioCotizado`.
- Checkout Session expira a los 30 min (mínimo que acepta Stripe).
- 3DS/SCA lo resuelve la página hospedada de Stripe.

**Webhook — flujo**

1. Verifica `stripe-signature` con el body crudo. Firma inválida: 400.
2. Upsert de `StripeEvent` (sin error ante entrega concurrente). Si ya tiene
   `processedAt`, responde 200 y termina.
3. En una sola transacción: `SELECT ... FOR UPDATE` de la solicitud; si ya no
   está en `RECIBIDA` no hace nada; si `payment_status !== 'paid'` no avanza;
   compara monto y moneda contra `precioCotizado`:
   - coincide: `PAGO_VALIDADO` + historial "Confirmado automáticamente vía Stripe";
   - no coincide: se queda en `RECIBIDA` con observación de discrepancia.
   En ambos casos guarda `stripeSessionId` y marca `processedAt`.
4. Cualquier error: rollback completo y 500 (Stripe reintenta).
5. Fuera de la transacción: correos SolicitudRecibida y NuevaOrden.

| Evento | Manejo |
|---|---|
| `checkout.session.completed` | Flujo anterior |
| `checkout.session.expired` | Solicitud a `CANCELADA` |
| `charge.dispute.created` | Log + alerta; `ip`/`userAgent` como evidencia |
| Otros | Se marcan procesados sin lógica |

**Pruebas** (`stripeWebhook.test.ts`): orden de middleware que rompe la firma,
evento duplicado transiciona una sola vez, monto distinto no avanza,
`payment_status` distinto de `paid` no avanza.

**Validación de entorno al arranque** (`lib/env.ts`): la API no arranca sin
`STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`, ni con una llave `sk_test_` en
`NODE_ENV=production`.

## 11. Correos (Resend + React Email)

| Template | Destinatario | Cuándo |
|---|---|---|
| SolicitudRecibida | Cliente | Al crear una solicitud por transferencia, o al confirmarse el pago con Stripe |
| FueraDeHorario | Cliente | Además del anterior, si la transferencia llega fuera de 9:00–23:00 (hora de CDMX) |
| NuevaOrden | Admins (`NOTIFICACION_NUEVA_ORDEN_EMAILS`) | Transferencia al crearse; tarjeta al confirmarse el pago |
| PagoRechazado | Cliente | Transición a `PAGO_RECHAZADO`, con la observación |
| QrEnviado | Cliente | Al subir QR + DN; incluye video tutorial opcional (`VIDEO_TUTORIAL_URL`) y aviso de 24 h para LMTR |
| RecordatorioActivacion | Cliente | Manual, desde el detalle de una solicitud en `QR_ENVIADO` |

Todos se envían en fire-and-forget: un error de correo se registra pero no
revierte la operación.

## 12. SIRED

```typescript
export interface SiredAdapter {
  reportarVenta(solicitudId: number, dn: string, compania: string): Promise<{ ok: boolean }>
}
// services/sired.ts — hoy solo registra en el log y regresa { ok: true }
export const siredAdapter: SiredAdapter = new StubSiredAdapter();
```

Se llama al pasar a `ACTIVADA` (si hay DN). Cuando exista la API real se
escribe `RealSiredAdapter` y se cambia solo esa línea.

## 13. Variables de entorno

**API (`apps/api/.env`)**: `DATABASE_URL`, `PORT`, `NODE_ENV`, `LOG_LEVEL`,
`WEB_URL` (CORS), `JWT_SECRET`, `JWT_EXPIRES_IN`, `RESEND_API_KEY`,
`EMAIL_FROM`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_BUCKET_NAME`, `R2_PUBLIC_URL`, `VIDEO_TUTORIAL_URL` (opcional),
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NOTIFICACION_NUEVA_ORDEN_EMAILS`.

**Web (`apps/web/.env`)**: `VITE_API_URL`, `VITE_TRANSFERENCIA_HABILITADA`
(Vite la lee al compilar; cambiarla requiere rebuild).

## 14. Huecos conocidos y pendientes

| # | Tema | Situación actual | Impacto |
|---|---|---|---|
| 1 | Cancelación automática de `PAGO_RECHAZADO` a las 24 h | No hay cron ni job; se hace a mano | Solicitudes rechazadas se acumulan si nadie las cancela |
| 2 | Restricción de estados por rol | Solo en frontend y reporte; el API de cola, detalle y transiciones acepta a cualquier admin autenticado | Un usuario GENERAL o RECARGAS puede ver o mover cualquier solicitud llamando al API directo |
| 3 | Turnstile / CAPTCHA | No implementado | Bloquea el paso a llaves live de Stripe (checklist abajo) |
| 4 | Retención de `StripeEvent` a 90 días | Script pendiente | Crecimiento de tabla a largo plazo |
| 5 | Fallback de consulta por id numérico | Activo, sin fecha de retiro registrada | Completar: backfill desplegado el 2026-09-07, retiro del fallback el ____ |
| 6 | SIRED | Stub | Esperando documentación de la API |
| 7 | Alerta de `charge.dispute.created` | Solo log; mecanismo de notificación por definir | Una disputa podría pasar desapercibida |
| 8 | ~~Botón de "Vende recargas"~~ | Resuelto 2026-11-17: la ruta existe y el botón tiene texto | — |
| 9 | Nombre de admin con acentos o ñ | `getAdminUser()` en `apps/web/src/lib/auth.ts` decodifica el JWT con `atob`, que no maneja UTF-8 | "Dueña" se muestra como "DueÃ±a" en el menú del panel. Solo visual |

## 15. Apertura para Fase 2 (rifa)

- Agregar `Boleto (id, solicitudId, numero, emitidoEn)` no modifica tablas
  existentes.
- Gate de elegibilidad: `estado === ACTIVADA` y la entrada de historial a
  `ACTIVADA` ocurre dentro de las 24 h posteriores a la de `QR_ENVIADO`.
- El correo QrEnviado ya incluye el aviso de 24 h; en Fase 2 se le agrega el
  número de boleto.

## 16. Checklist de salida a llaves live de Stripe

- [ ] Turnstile (o CAPTCHA equivalente) activo en el formulario de compra.
- [ ] Reglas de Radar revisadas: velocidad de intentos, card testing, mismatch de CVC.
- [ ] `STRIPE_WEBHOOK_SECRET` de producción generado para el endpoint de prod (distinto al de `stripe listen`).
- [ ] `.env` de Railway sin ninguna llave `sk_test_` ni `whsec_` de test.
- [ ] Webhook de prod apuntando a la URL real de la API.
- [ ] Eventos suscritos: `checkout.session.completed`, `checkout.session.expired`, `charge.dispute.created`.

## 17. Módulo: Registro de negocios para recargas (implementado 2026-11-17)

### Objetivo

Que un negocio (tiendita, papelería, farmacia) se registre desde "Vende
recargas" para usar la plataforma de recargas de MEGATAE. El negocio paga por
transferencia, mesa de control valida el pago, da de alta al negocio en la
plataforma de recargas (paso manual, fuera de este sistema) y le envía por
correo su usuario y contraseña. Mismo patrón que la eSIM: donde la eSIM entrega
QR + DN, aquí se entrega usuario + contraseña.

### Decisiones de producto (confirmadas por Edgar, 2026-11-16)

- **Solo transferencia bancaria.** Stripe no aplica a este módulo.
- **Depósito mínimo de $500 MXN.** El negocio puede depositar más; mesa de
  control verifica en el comprobante que el monto sea igual o mayor al mínimo.
- **Cuentas bancarias distintas a las de la eSIM.**
- **Contraseña genérica.** La plataforma de recargas obliga a cambiarla en el
  primer inicio de sesión.
- **Datos del formulario:** nombre completo, correo, número telefónico, nombre
  del negocio y giro, más el comprobante de pago.
- **Giro con lista de opciones** (tienda de abarrotes, farmacia, papelería,
  etc.), con "Otro" + texto libre para lo que no esté en la lista.

### Decisiones técnicas

- **Tabla propia (`RegistroRecargas`), no se reutiliza `Solicitud`.** `Solicitud`
  exige compañía, plan y LADA, que aquí no existen; mezclarlas ensuciaría la cola
  y los reportes de la eSIM.
- **La contraseña no se guarda en la base de datos.** El admin la captura, viaja
  solo en el correo y se descarta. Se guarda únicamente el usuario. Aunque sea
  genérica, guardarla no aporta nada (si el negocio la pierde, se restablece en
  la plataforma de recargas y se envía otra) y sí agrega riesgo. Tampoco se
  escribe en logs: el endpoint no registra el body y los errores de validación
  no repiten valores.
- **El monto mínimo vive en la API** (`MONTO_MINIMO_REGISTRO_RECARGAS`, default
  500) y el frontend lo lee de un endpoint de configuración. Así se cambia sin
  recompilar la web.
- **El monto real lo captura el admin al validar** (`montoValidado`). El cliente
  no declara monto; el backend rechaza validar si `montoValidado` es menor al
  mínimo. Sirve también para reportes de ingresos.
- **Cuentas bancarias separadas con un campo `destino`** en la tabla existente,
  en vez de una tabla nueva: se reutiliza toda la configuración del admin
  (crear, editar, activar, reordenar) filtrando por destino.
- **Permisos validados en el backend desde el inicio** (a diferencia del hueco 2
  de la sección 14): middleware `requireRol("PRO", "RECARGAS")` en todas las
  rutas admin del módulo.
- **Giro como catálogo en código, no como enum de Postgres.** La lista vive en
  `apps/api/src/lib/giros.ts`; la columna guarda la clave (`FARMACIA`, etc.) y
  la API la valida. El formulario recibe la lista de la API, así que agregar una
  opción es editar ese archivo y desplegar la API, sin migración ni rebuild de
  la web. Para retirar una opción se marca `activo: false` (no se borra, para
  que los registros que ya la usan sigan mostrando su etiqueta). Si se elige
  `OTRO`, se exige `giroOtro` (texto, mín. 3 caracteres).
- **Folio con prefijo `RR-`** (mismo generador que el `MT-` de eSIM, con el
  prefijo como parámetro).
- **El correo de credenciales se envía dentro de la transacción** que cambia el
  estado: si Resend falla, se hace rollback y el registro sigue en
  `PAGO_VALIDADO` para reintentar (la API responde 502). El update está
  condicionado al estado, así que un doble clic no manda dos correos.
- **El comprobante debe venir del bucket propio** (`R2_PUBLIC_URL`); la API
  rechaza URLs de otros sitios.

### Modelo de datos

```prisma
enum DestinoCuenta { ESIM RECARGAS }

enum EstadoRegistro {
  RECIBIDO
  REVISION_PAGO
  PAGO_RECHAZADO
  PAGO_VALIDADO
  CREDENCIALES_ENVIADAS
  CANCELADO
}

model CuentaBancaria {
  // ... campos existentes sin cambios ...
  destino DestinoCuenta @default(ESIM)   // las cuentas actuales quedan como ESIM
}

model RegistroRecargas {
  id                     Int            @id @default(autoincrement()) // solo rutas admin
  publicCode             String         @unique  // folio público "RR-XXXXXXXXXX"
  nombreCompleto         String
  email                  String
  telefono               String
  nombreNegocio          String
  giro                   String                  // clave de GIROS_NEGOCIO (lib/giros.ts)
  giroOtro               String?                 // solo si giro = "OTRO"
  comprobante            String                  // URL en R2, requerido
  montoValidado          Decimal?       @db.Decimal(10, 2) // capturado por el admin al validar
  estado                 EstadoRegistro @default(RECIBIDO)
  observacion            String?
  usuarioPlataforma      String?                 // usuario entregado; la contraseña NO se guarda
  credencialesEnviadasAt DateTime?
  createdAt              DateTime       @default(now())
  updatedAt              DateTime       @updatedAt
  historial              HistorialRegistroRecargas[]

  @@index([estado])
}

model HistorialRegistroRecargas {
  id             Int              @id @default(autoincrement())
  registroId     Int
  registro       RegistroRecargas @relation(fields: [registroId], references: [id])
  estadoAnterior EstadoRegistro
  estadoNuevo    EstadoRegistro
  adminId        Int?
  admin          Admin?           @relation(fields: [adminId], references: [id])
  observacion    String?
  createdAt      DateTime         @default(now())

  @@index([registroId])
}
```

Una sola migración (`20261117120000_add_registro_recargas`), sin backfill: `destino` tiene
default y las tablas nuevas empiezan vacías.

### Máquina de estados

```
RECIBIDO        → REVISION_PAGO
REVISION_PAGO   → PAGO_VALIDADO (exige montoValidado ≥ mínimo) | PAGO_RECHAZADO
PAGO_RECHAZADO  → CANCELADO
PAGO_VALIDADO   → CREDENCIALES_ENVIADAS   (solo vía POST /:id/credenciales)
CREDENCIALES_ENVIADAS, CANCELADO: estados finales
```

Mapa propio `TRANSICIONES_REGISTRO` en `lib/transitions.ts`, mismo mecanismo
que la eSIM (422 ante transición no listada).

### Flujo

1. El negocio llega a `/registro-negocio` desde el botón de "Vende recargas".
2. Llena sus datos; ve el monto mínimo y las cuentas con destino `RECARGAS`
   (con botón de copiar CLABE); sube el comprobante a R2 con presigned URL.
3. `POST /api/registros-recargas` crea el registro en `RECIBIDO`. Correos:
   confirmación al negocio y aviso a los admins.
4. Pantalla de confirmación con folio `RR-...`.
5. Mesa de control (PRO o RECARGAS) lo toma de la cola, compara el comprobante
   con el mínimo, captura `montoValidado` y valida, o rechaza con observación.
6. Mesa de control da de alta al negocio en la plataforma de recargas (manual).
7. Captura usuario + contraseña genérica en el detalle; se envía el correo de
   credenciales y el registro pasa a `CREDENCIALES_ENVIADAS`.

### Endpoints

Públicos (rate limit 20 / 15 min, igual que solicitudes):

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/registros-recargas/config | `{ montoMinimo, giros, cuentas }` — catálogo de giros activos y solo cuentas activas con destino RECARGAS |
| POST | /api/registros-recargas/presigned-url | URL firmada para el comprobante |
| POST | /api/registros-recargas | Crea el registro; teléfono se normaliza a dígitos y correo a minúsculas |

Admin (JWT + `requireRol("PRO", "RECARGAS")`):

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/admin/registros-recargas?estado=X | Cola filtrada por estado (incluye `giroEtiqueta`) |
| GET | /api/admin/registros-recargas/:id | Detalle con comprobante, `montoMinimo`, `giroEtiqueta` e historial |
| PATCH | /api/admin/registros-recargas/:id/estado | `{ estado, observacion?, montoValidado? }` |
| POST | /api/admin/registros-recargas/:id/credenciales | `{ usuario, contrasena }` — envía correo, guarda solo `usuario` |

Cambio a endpoints existentes:

| Ruta | Cambio |
|---|---|
| GET /api/cuentas-bancarias | Filtra `destino = ESIM` (hoy regresa todas las activas) |
| GET /api/admin/cuentas-bancarias | Acepta `?destino=ESIM|RECARGAS` |
| POST, PATCH /api/admin/cuentas-bancarias | Aceptan `destino` |
| POST /api/admin/cuentas-bancarias/reorder | Reordena dentro de un mismo destino |

### Correos

| Template | Destinatario | Cuándo |
|---|---|---|
| RegistroRecargasRecibido | Negocio | Al crear el registro, con folio |
| NuevoRegistroRecargas | Admins (`NOTIFICACION_NUEVA_ORDEN_EMAILS`) | Al crear el registro, con liga al detalle |
| RegistroRecargasRechazado | Negocio | `→ PAGO_RECHAZADO`, con observación |
| CredencialesRecargas | Negocio | Al enviar credenciales: usuario, contraseña genérica, liga a la plataforma (`PLATAFORMA_RECARGAS_URL`) y aviso de que debe cambiarla al entrar |

### Frontend

- `pages/recargas/RegistroNegocio.tsx`: formulario (giro como `<select>` con
  campo "¿Cuál?" si se elige Otro), monto mínimo, cuentas con botón de copiar,
  upload del comprobante, aceptación del aviso de privacidad y confirmación con
  folio en la misma página. Ruta `/registro-negocio` en `App.tsx`.
- `HeroRecargas.tsx`: los dos banners de la página "Vende recargas" ahora tienen
  texto ("Registra tu negocio") y llevan a `/registro-negocio` (antes estaban
  vacíos).
- `pages/admin/RegistrosRecargas.tsx`: cola con tabs por estado, contador,
  buscador (nombre, negocio o folio), paginación e indicador de más de 24 h.
- `pages/admin/RegistroRecargasDetalle.tsx`: datos, historial, comprobante con
  mínimo esperado; acciones por estado (iniciar revisión, capturar monto y
  validar, rechazar con motivo, cancelar, capturar usuario + contraseña con
  botón "Generar" y confirmación antes de enviar).
- `pages/admin/registrosRecargasUi.ts`: etiquetas, colores y helpers comunes.
- `AdminLayout`: entrada "Registros de recargas" visible para PRO y RECARGAS.
- `Configuracion.tsx`, pestaña de cuentas: siempre visible. Selector
  eSIM / Registro de recargas; la opción eSIM solo aparece si
  `VITE_TRANSFERENCIA_HABILITADA=true`.

### Variables de entorno nuevas (API)

- `MONTO_MINIMO_REGISTRO_RECARGAS` (default 500)
- `PLATAFORMA_RECARGAS_URL` (liga que va en el correo de credenciales)

### Fuera de alcance de esta iteración

- Reporte Excel de registros (se puede agregar después reutilizando `reportes.ts`).
- Cancelación automática a 24 h de un pago rechazado (mismo hueco 1 que la eSIM;
  si se resuelve con un job, debe cubrir ambos módulos).
- Integración automática con la plataforma de recargas para crear el usuario.

### Cómo se probó (2026-11-17)

- Las 8 migraciones aplicadas en orden sobre PostgreSQL 17 limpio.
- Prueba end-to-end de la API (42 casos): validaciones del formulario, permisos
  (GENERAL recibe 403), máquina de estados, monto menor al mínimo, rollback
  cuando falla el correo de credenciales, doble clic concurrente (un solo
  correo), contraseña ausente en todas las tablas y en el log, rechazo con
  correo, cuentas por destino sin cruzarse con el checkout de eSIM.
- Recorrido en navegador (Chrome) del formulario y del panel completo con los
  roles RECARGAS, GENERAL y PRO.
- Suite existente del webhook de Stripe (4 pruebas) en verde; `tsc --noEmit`
  limpio en `apps/api` y `apps/web`; `vite build` correcto.

### Complejidad

**Baja-media.** Reutiliza R2, Resend, la cola por estado y la configuración de
cuentas. Lo nuevo y delicado es solo el manejo de la contraseña (no persistirla,
no loggearla) y el filtro de cuentas por destino sin romper el checkout de eSIM.

## Cambios respecto a la versión anterior

- Rol nuevo `RECARGAS` y tabla de roles.
- `Plan` con `megas`, `dias` y `destacado`; `telefono` opcional.
- Ruta `/pago` eliminada: datos y pago en `/comprar`; stepper de 2 pasos.
- Rutas nuevas del sitio: landings por compañía (`/v1/eSIM-*`), Conócenos,
  Vende recargas, Registro, `/consultar`, `/admin/reportes`.
- Endpoints nuevos: `stripe/cancelar`, `recordatorio`, `cuentas-bancarias/reorder`,
  reporte Excel.
- De 3 a 6 correos (NuevaOrden, FueraDeHorario, RecordatorioActivacion).
- Addendum de Stripe integrado al cuerpo del documento; expiración del checkout a 30 min.
- Estructura de carpetas actualizada a la real.
- Sección nueva de huecos conocidos (incluye los dos que no estaban documentados:
  cancelación a 24 h sin job y restricción por rol solo en frontend).
- 2026-11-16: diseño del módulo de registro de negocios para recargas
  (sección 17); hueco 8 (ruta `/registro-negocio` inexistente).
- 2026-11-17: módulo de recargas implementado; giro como catálogo; hueco 8
  resuelto.

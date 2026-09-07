# MEGATAE eSIM — Arquitectura del sistema (Fase 2)

## Diagrama de sistema

```
[Browser del cliente]
       |
       v
[React SPA — Vite + Tailwind]
  /              → Landing pública
  /comprar       → Step 1: datos del cliente + selección de plan
  /pago          → Step 2: cuentas bancarias + upload de comprobante
  /gracias       → Step 3: confirmación "Recibimos tu información"
  /admin/*       → Panel admin (rutas protegidas con JWT)
       |
       | HTTP / REST JSON
       v
[Node.js + Express]
  Rutas públicas:  GET /planes, GET /cuentas-bancarias,
                   POST /solicitudes, POST /solicitudes/presigned-url, POST /leads
  Rutas admin:     GET|PATCH /admin/solicitudes, POST /admin/solicitudes/:id/qr,
                   CRUD /admin/planes, CRUD /admin/cuentas-bancarias
  Middleware:      auth JWT, validación de input, rate-limit
       |
       v
[PostgreSQL — Prisma ORM]

Servicios externos:
  [Cloudflare R2]    ← comprobantes + QRs (presigned URL, subida directa desde browser)
  [Resend]           ← 3 templates transaccionales (React Email)
  [SIRED Adapter]    ← stub ahora; swap a implementación real sin refactor
```

## Stack tecnológico

| Capa | Tecnología | Razón |
|---|---|---|
| Frontend | React + Vite + Tailwind | Mismo patrón que Rifadísimos; Vite elimina tiempos lentos de CRA |
| Routing | React Router v6 | Estándar para SPAs |
| Server state | TanStack React Query | Manejo limpio de loading/error/refetch en la cola del admin |
| Backend | Node.js + Express | Consistente con Rifadísimos |
| ORM | Prisma | Ya definido; type-safe, migraciones declarativas |
| DB | PostgreSQL | Relacional; consultas de cola por estado son triviales |
| Archivos | Cloudflare R2 | Sin egress fee, API S3-compatible, más barato que S3 |
| Email | Resend + React Email | Ya definido en el brief; templates en JSX |
| Auth | JWT + bcrypt | Sin dependencia de servicio externo; adecuado para 4 admins |

## Estructura de carpetas

```
megatae-esim/
├── apps/
│   ├── web/                   # React + Vite
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── landing/
│   │       │   ├── comprar/   # Step1Datos.tsx → Step2Pago.tsx → Step3Gracias.tsx
│   │       │   └── admin/     # Cola.tsx, DetalleSolicitud.tsx, Planes.tsx, Cuentas.tsx
│   │       ├── components/
│   │       ├── hooks/
│   │       └── lib/           # api-client.ts, utils
│   └── api/                   # Node.js + Express
│       └── src/
│           ├── routes/
│           ├── middleware/     # auth.ts, validate.ts
│           ├── services/
│           │   ├── email.service.ts
│           │   ├── storage.service.ts
│           │   └── sired.adapter.ts   ← stub aquí
│           ├── emails/
│           │   ├── SolicitudRecibida.tsx
│           │   ├── PagoRechazado.tsx
│           │   └── QrEnviado.tsx
│           └── prisma/
│               └── schema.prisma
└── package.json               # pnpm workspaces
```

## Modelo de datos (Prisma)

```prisma
enum Compania { ATT MOVISTAR BAIT }

enum EstadoSolicitud {
  RECIBIDA
  REVISION_PAGO
  PAGO_RECHAZADO
  PAGO_VALIDADO
  EN_ACTIVACION
  QR_ENVIADO
  ACTIVADA
  CANCELADA
}

enum RolAdmin { PRO GENERAL }

model Plan {
  id          Int        @id @default(autoincrement())
  compania    Compania
  precio      Decimal    @db.Decimal(10,2)
  recarga     Decimal    @db.Decimal(10,2)
  descripcion String?
  activo      Boolean    @default(true)
  createdAt   DateTime   @default(now())
  solicitudes Solicitud[]
}

model Solicitud {
  id           Int               @id @default(autoincrement())
  nombre       String
  email        String
  telefono     String
  ciudad       String?           // solo AT&T
  estadoMx     String?           // estado del cliente (México), solo AT&T — campo distinto al estado del flujo
  lada         String?           // derivada según compañía (55 para Movistar/Bait, elegida para AT&T)
  compania     Compania
  planId       Int
  plan         Plan              @relation(fields: [planId], references: [id])
  comprobante  String            // URL en R2
  estado       EstadoSolicitud   @default(RECIBIDA)
  observacion  String?           // nota de rechazo u otro comentario del admin
  qrUrl        String?           // URL del QR en R2
  dn           String?           // número asignado, capturado a mano por mesa de control
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  historial    HistorialEstado[]
  // Fase 2: boleto Boleto? — se agrega sin modificar este modelo
}

model HistorialEstado {
  id             Int              @id @default(autoincrement())
  solicitudId    Int
  solicitud      Solicitud        @relation(fields: [solicitudId], references: [id])
  estadoAnterior EstadoSolicitud
  estadoNuevo    EstadoSolicitud
  adminId        Int?
  admin          Admin?           @relation(fields: [adminId], references: [id])
  observacion    String?
  createdAt      DateTime         @default(now())
}

model CuentaBancaria {
  id      Int     @id @default(autoincrement())
  banco   String
  titular String
  cuenta  String?
  clabe   String?
  activo  Boolean @default(true)
  orden   Int     @default(0)    // controla el orden de display al cliente
}

model Lead {
  id             Int      @id @default(autoincrement())
  email          String
  aceptoTerminos Boolean
  createdAt      DateTime @default(now())
}

model Admin {
  id           Int              @id @default(autoincrement())
  email        String           @unique
  passwordHash String
  nombre       String
  rol          RolAdmin
  activo       Boolean          @default(true)
  createdAt    DateTime         @default(now())
  historial    HistorialEstado[]
}
```

## Transiciones de estado válidas

```
RECIBIDA        → REVISION_PAGO
REVISION_PAGO   → PAGO_RECHAZADO | PAGO_VALIDADO
PAGO_RECHAZADO  → CANCELADA          (manual o automática a las 24h)
PAGO_VALIDADO   → EN_ACTIVACION
EN_ACTIVACION   → QR_ENVIADO
QR_ENVIADO      → ACTIVADA | CANCELADA
```

El backend define un objeto `TRANSICIONES_VALIDAS: Record<EstadoSolicitud, EstadoSolicitud[]>`.
El endpoint `PATCH /admin/solicitudes/:id/estado` consulta ese mapa antes de ejecutar el update.
Cualquier transición no listada devuelve HTTP 422.

## Endpoints

### Públicos

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/planes | Planes activos (para tarjetas en landing) |
| GET | /api/cuentas-bancarias | Cuentas activas ordenadas (para mostrar en /pago) |
| POST | /api/solicitudes/presigned-url | Obtener URL firmada para subir comprobante a R2 |
| POST | /api/solicitudes | Crear solicitud (JSON con la URL del comprobante ya subido) |
| POST | /api/leads | Registrar email del lead magnet |

### Admin (JWT requerido)

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | /api/auth/login | — | Autenticación |
| GET | /api/admin/solicitudes?estado=X | GENERAL/PRO | Cola filtrada por estado |
| GET | /api/admin/solicitudes/:id | GENERAL/PRO | Detalle con historial |
| PATCH | /api/admin/solicitudes/:id/estado | GENERAL/PRO | Avanzar/rechazar estado |
| POST | /api/admin/solicitudes/:id/qr | GENERAL/PRO | Guardar QR URL + DN, dispara correo |
| POST | /api/admin/solicitudes/:id/qr/presigned-url | GENERAL/PRO | URL firmada para subir QR a R2 |
| GET | /api/admin/planes | GENERAL/PRO | Listar todos (incluyendo inactivos) |
| POST | /api/admin/planes | PRO | Crear plan |
| PATCH | /api/admin/planes/:id | PRO | Editar plan |
| GET | /api/admin/cuentas-bancarias | GENERAL/PRO | Listar todas |
| POST | /api/admin/cuentas-bancarias | PRO | Crear cuenta bancaria |
| PATCH | /api/admin/cuentas-bancarias/:id | PRO | Editar cuenta bancaria |

## Flujo de upload de archivos (presigned URL)

1. Frontend solicita `POST /api/solicitudes/presigned-url` con `{ contentType, filename }`
2. Backend genera URL firmada en R2 (expiración: 10 min)
3. Frontend sube el archivo directamente a R2 desde el browser (sin pasar por Express)
4. Frontend recibe la URL pública del objeto subido
5. Frontend hace `POST /api/solicitudes` con los campos del formulario + la URL del comprobante

El mismo flujo aplica para el QR que sube el admin desde el panel.

Archivos huérfanos (upload iniciado pero solicitud nunca creada): se limpian con una política
de lifecycle en el bucket R2 (eliminar objetos sin referencia después de 24h).

## Correos transaccionales (Resend + React Email)

| Template | Trigger | Contenido |
|---|---|---|
| SolicitudRecibida | POST /api/solicitudes exitoso | "Felicidades por tu compra, en un momento recibirás tu QR" |
| PagoRechazado | PATCH estado → PAGO_RECHAZADO | Motivo del rechazo (campo `observacion`) + instrucciones |
| QrEnviado | POST /admin/solicitudes/:id/qr | QR (imagen), DN, link a video tutorial, aviso de 24h para LMTR |

Los templates viven en `apps/api/src/emails/` como componentes React.

## SIRED Adapter

```typescript
// Interfaz — no cambia cuando llegue la API real
interface SiredAdapter {
  reportarVenta(solicitudId: number, dn: string, compania: Compania): Promise<{ ok: boolean }>
}

// Implementación actual (stub)
class StubSiredAdapter implements SiredAdapter {
  async reportarVenta(solicitudId, dn, compania) {
    console.log('[SIRED stub] reportarVenta', { solicitudId, dn, compania })
    return { ok: true }
  }
}

// Implementación futura — mismo contrato, distinta lógica interna
// class RealSiredAdapter implements SiredAdapter { ... }
```

Se instancia vía inyección en el service de solicitudes. Cuando la API real esté disponible,
solo se cambia la implementación — ningún otro archivo se toca.

## Apertura para Fase 2 (rifa)

- `Solicitud` ya tiene `dn` y el timestamp exacto de la transición a `ACTIVADA` (vía `HistorialEstado`)
- Agregar `Boleto (id, solicitudId, numero, emitidoEn)` no modifica ninguna tabla existente
- El email `QrEnviado` ya incluye el copy de las 24h — en Fase 2 se añade el número de boleto al mismo template
- El gate de elegibilidad de boleto es: `solicitud.estado === ACTIVADA && HistorialEstado donde estadoNuevo=ACTIVADA.createdAt <= qrEnviadoAt + 24h`

## Complejidad estimada

**Media-baja.** Los puntos más delicados son:
1. El state machine de la solicitud con validación de transiciones en backend
2. El flujo presigned URL + upload directo a R2 + creación de solicitud
3. La UI de cola de trabajo del admin (no es un CRUD genérico — es una vista por estado)

El resto es CRUD estándar sobre un modelo de datos claro y ya conocido para el equipo.

## Addendum — Pasarela Stripe (post Fase 6)

Fuera de alcance de Fase 1 según el brief original ("Integración real de pasarela
de pago"). Se agrega ahora como módulo adicional, conviviendo con el depósito
bancario manual (no lo reemplaza). Diseñado y validado contra
`docs/STRIPE_SECURITY_CHECKLIST.md` antes de escribir código. Revisión de 8
puntos aplicada tras una segunda pasada de Edgar sobre esta misma sección —
ver historial de git para el diff exacto.

### Decisiones de producto

- Stripe es un **método de pago adicional**, no reemplaza transferencia bancaria.
- Solo tarjeta en esta iteración (ver "Métodos de pago habilitados" abajo).
- Cuando Stripe confirma el cobro (webhook) **y el pago quedó efectivamente
  pagado**, la solicitud **salta directo a `PAGO_VALIDADO`** — no pasa por
  `REVISION_PAGO` manual, porque ya no hay comprobante que mesa de control
  tenga que comparar a ojo.
- Excepción: si el monto cobrado por Stripe no coincide con el precio
  cotizado al crear el checkout (ver "Precio congelado" abajo), la solicitud
  se queda en `RECIBIDA` con una `observacion` de discrepancia, para que un
  humano la revise — no se auto-avanza en ese caso.

### Métodos de pago habilitados

El Checkout Session se crea con `payment_method_types: ['card']` explícito,
**no** `automatic_payment_methods`. Esto es deliberado: dejar Stripe elegir
métodos automáticamente habilitaría OXXO y SPEI en cuanto estén activos en el
dashboard de la cuenta, sin que el código lo decida — y esos métodos son
asíncronos (el pago se confirma minutos u horas después, no en el redirect).

Habilitar OXXO/SPEI es una **iteración aparte**, no parte de este módulo,
porque requiere:
- Manejar `checkout.session.async_payment_succeeded` y
  `checkout.session.async_payment_failed` (el estado de la solicitud no se
  puede decidir en el momento de crear el checkout).
- Ajustar el copy de `/gracias` ("tu pago está siendo verificado" en vez de
  confirmación inmediata).
- Revisar si esos métodos entran también al fast-path de auto-validación o si
  ameritan quedarse en revisión manual por default.

### Precio congelado

```prisma
precioCotizado  Int?     // centavos, congelado al crear el Checkout Session
```

El webhook compara `session.amount_total` contra `precioCotizado`, **no**
contra el precio vivo de `Plan` en ese momento. Razón: si el admin edita el
precio de un plan entre que el cliente abre el checkout y paga (ej. ajusta una
promoción), una solicitud legítima no debe caer en la rama de discrepancia
solo por esa coincidencia de tiempos — el cliente pagó exactamente lo que se
le cotizó, eso es lo que se valida.

### Expiración del token de acceso

```prisma
accessTokenExpiresAt  DateTime?   // createdAt + 48h
```

`GET /api/solicitudes/by-token/:accessToken` valida `accessTokenExpiresAt` además
de que el token exista; si expiró, responde igual que si no existiera (genérico,
sin distinguir "expiró" de "nunca existió" en el mensaje). Pasadas las 48h, el
cliente usa `POST /api/solicitudes/consultar` (folio + correo) como cualquier
otra solicitud — el `accessToken` es exclusivamente para el aterrizaje
inmediato post-pago, no un mecanismo de seguimiento de largo plazo.

### Evidencia para contracargos

```prisma
ip         String?   // capturado en POST /api/solicitudes/stripe/checkout
userAgent  String?   // idem
```

Se capturan solo en el flujo de Stripe (donde hay riesgo real de contracargo
por tarjeta) al momento de crear el checkout, no en el flujo de transferencia.

### Cambios al modelo de datos (consolidado)

```prisma
enum MetodoPago { TRANSFERENCIA STRIPE }

model Solicitud {
  // ... campos existentes sin cambios ...
  publicCode           String?         @unique  // nanoid(10), alfabeto sin ambiguos, prefijo "MT-"
                                                 // nullable → backfill → NOT NULL (ver migración)
  comprobante          String?                  // pasa de requerido a opcional (ver validación abajo)
  metodoPago           MetodoPago      @default(TRANSFERENCIA)
  precioCotizado        Int?                    // centavos, congelado al crear el Checkout Session
  stripeSessionId       String?         @unique // ver "Correlación en discrepancia" — se escribe
                                                 // en ambas ramas del webhook, no solo si hay éxito
  accessToken           String?         @unique // token opaco de 32 bytes
  accessTokenExpiresAt  DateTime?               // createdAt + 48h
  ip                    String?                 // solo Stripe, evidencia para contracargos
  userAgent             String?                 // solo Stripe, evidencia para contracargos
}

model StripeEvent {
  id          String    @id        // event.id de Stripe — PK, no se genera nada propio
  type        String
  processedAt DateTime?            // null = no confirmado como procesado; distinción explícita
                                    // de "existe la fila" vs "se completó el procesamiento"
  createdAt   DateTime  @default(now())
}
```

**Validación de aplicación (no de schema):** `comprobante` es nullable a nivel
de base de datos porque Stripe no sube comprobante, pero el endpoint sigue
exigiéndolo cuando `metodoPago` es `TRANSFERENCIA` (o no se especifica) —
la regla vive en el `zod` schema de `POST /api/solicitudes`, no en la
columna. Sin esto, el paso a nullable dejaría un hueco donde una solicitud de
transferencia se crea sin comprobante.

`publicCode` es el folio que se muestra al cliente (emails, `/gracias`, consulta
de estado) — sustituye al `id` autoincremental en toda superficie pública desde
ahora. El `id` interno se conserva como PK y sigue usándose en las rutas del
**panel admin** (autenticadas con JWT, no expuestas a usuarios anónimos) — no
hay beneficio de seguridad en cambiar eso ahí, solo complejidad extra.

**Migración en 3 pasos** (no se puede hacer en una sola por los datos ya
existentes en prod):
1. Agregar `publicCode` como columna nullable.
2. Script de backfill (`apps/api/src/prisma/backfill-public-code.ts`, mismo
   patrón que `seed.ts`) que genera un `publicCode` para cada `Solicitud`
   existente.
3. Migración que la vuelve `NOT NULL`.

Los correos ya enviados antes de este cambio referencian el `id` numérico como
folio (ej. "Solicitud #47") — la consulta de estado acepta **ambos formatos**
durante la transición: el fallback por `id` numérico se activa por **prefijo**
(si el valor no empieza con `MT-`, se intenta como `id`), no por "parece un
número" — un `publicCode` nunca podría confundirse con un id aunque cambiara
el alfabeto. **Fecha de retiro del fallback: 6 meses después de que el backfill
corra en producción** (fecha exacta a registrar en este documento el día del
despliegue — placeholder hasta entonces: `backfill desplegado el ____, retiro
del fallback el ____`).

### Endpoints nuevos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | /api/solicitudes/stripe/checkout | público, rate-limited | Valida `planId` contra BD (el precio nunca lo manda el cliente), crea la `Solicitud` en `RECIBIDA` con `accessToken` + `precioCotizado` + `ip`/`userAgent`, crea el Checkout Session de Stripe (`payment_method_types: ['card']`) con `metadata: { solicitudId }` (sin PII), regresa `{ url }` |
| POST | /api/stripe/webhook | firma de Stripe (no JWT) | Verifica `constructEvent`, dedupe por `StripeEvent.id`, hace `SELECT ... FOR UPDATE` sobre la `Solicitud` ya creada, valida `payment_status` y monto, transiciona estado |
| GET | /api/solicitudes/by-token/:accessToken | público, rate-limited | Usado solo por `/gracias` justo después del redirect de Stripe. Respuesta genérica si el token no existe o expiró |
| POST | /api/solicitudes/consultar | público, rate-limited | Body `{ folio, email }` — consulta de estado general (cualquier método de pago), exige coincidencia de correo, respuesta genérica ante no-match |

La `Solicitud` se crea **antes** de mandar al cliente a Stripe (mismo momento
relativo que hoy con transferencia), no en el webhook — así el webhook nunca
necesita reconstruir datos personales desde `metadata` de Stripe, solo
transicionar una fila que ya existe. Esto es lo que hace válido el "lock de
fila `FOR UPDATE`" del checklist: si la solicitud se creara en el webhook, no
habría fila previa que lockear.

### Webhook — flujo exacto

```
1. Verificar stripe-signature contra STRIPE_WEBHOOK_SECRET (raw body, ruta
   montada antes de cualquier express.json() global). Firma inválida → 400,
   sin tocar nada más.
2. Upsert de StripeEvent con onConflict doNothing (id = event.id, type,
   processedAt: null) — una entrega concurrente del mismo evento no produce
   un 500 por unique violation, simplemente no pisa la fila existente.
   - Si tras el upsert la fila tiene processedAt != null → ya procesado,
     responder 200, no hacer nada más.
3. Dentro de UNA sola transacción (incluye el paso 4 — ver "Atomicidad"):
   a. SELECT ... FOR UPDATE sobre la Solicitud (por metadata.solicitudId).
   b. Si solicitud.estado !== 'RECIBIDA' → ya se procesó por otra vía, no-op,
      saltar a 3e.
   c. Si session.payment_status !== 'paid' → no transicionar (aplica incluso
      con solo tarjeta habilitada: un intento con 3DS pendiente, por ejemplo,
      puede completar el Checkout Session sin que el pago esté 'paid' todavía).
      Saltar a 3e sin tocar la Solicitud.
   d. Comparar session.amount_total/currency contra precioCotizado (no el
      precio vivo del plan — ver "Precio congelado").
      - Coincide → estado = PAGO_VALIDADO, se agrega HistorialEstado
        (adminId null, observacion "Confirmado automáticamente vía Stripe").
      - No coincide → estado se queda en RECIBIDA, observacion = discrepancia
        de monto, para revisión manual normal.
      - En ambos casos: stripeSessionId = session.id. Es un identificador de
        correlación para poder rastrear el pago desde la solicitud, no una
        marca de "pago exitoso" — por eso se escribe también en la rama de
        discrepancia.
   e. StripeEvent.processedAt = now() — misma transacción que 3a-3d, no un
      UPDATE aparte después de cerrarla.
4. Responder 200.
5. Cualquier error dentro de la transacción → rollback completo (incluyendo
   el processedAt del paso 3e), responder 500 (Stripe reintenta el evento
   completo desde cero, que es lo correcto porque nada quedó a medias).
6. Fuera de la transacción, fire-and-forget: correo SolicitudRecibida (solo
   si quedó en PAGO_VALIDADO).
```

### Otros eventos de Stripe suscritos

| Evento | Manejo |
|---|---|
| `checkout.session.completed` | Flujo principal, arriba |
| `checkout.session.expired` | Solicitud pasa a `CANCELADA` con `observacion: "Checkout de Stripe expiró sin completar el pago"` (transición de sistema, no pasa por `transicionValida()` — ver nota abajo). Evita que sesiones abandonadas ensucien la cola de mesa de control mezcladas con transferencias legítimas pendientes de revisión. Distinguible en el panel por `metodoPago: STRIPE` en la vista de detalle (ajuste de UI queda para la Iteración 2, frontend) |
| `charge.dispute.created` | No es una transición de estado (no existe un estado "en disputa" en el flujo). Se registra en log estructurado y dispara una alerta operativa (correo a mesa de control — mecanismo exacto de notificación a definir en implementación). `ip`/`userAgent`/`createdAt` de la `Solicitud` quedan como evidencia disponible para responder el contracargo ante Stripe |
| Cualquier otro evento | `default` silencioso — se marca `processedAt` igual (para no reintentar indefinidamente) pero no dispara lógica de negocio |

**Nota sobre transiciones de sistema:** tanto el paso a `PAGO_VALIDADO` del
webhook como el paso a `CANCELADA` por expiración ocurren en código de
sistema, no vía `PATCH /api/admin/solicitudes/:id/estado` — por lo tanto no
pasan por `transicionValida()` ni necesitan agregarse a
`TRANSICIONES_VALIDAS`, que gobierna únicamente las transiciones manuales que
dispara mesa de control.

### SCA (Strong Customer Authentication)

No aplica manejo propio: Checkout hospedado de Stripe resuelve 3DS/SCA
enteramente en su página antes de disparar `checkout.session.completed` —
el backend nunca ve un estado intermedio de autenticación pendiente, solo el
resultado final vía `payment_status`.

### Seguridad — mapeo directo a `docs/STRIPE_SECURITY_CHECKLIST.md`

- **§1 Claves:** `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` solo en `.env`
  (nunca en `.env.example`), `apiVersion` fijo al instanciar el cliente,
  validación de arranque (zod) que falla si `NODE_ENV=production` con una key
  `sk_test_`.
- **§2 Frontera cliente/servidor:** el único input del cliente al crear el
  checkout es `planId`; precio se resuelve server-side y se congela en
  `precioCotizado`.
- **§3 Ownership sin cuentas:** no hay login de cliente en este producto —
  sustituido por: precio server-side, rate limit + Turnstile en el endpoint
  público, `accessToken` opaco con alcance único y expiración de 48h (solo
  `/gracias`), consulta general por folio+correo con respuesta genérica.
- **§4 Webhook:** raw body antes de `express.json()`, `constructEvent` en un
  solo lugar, falla cerrado, dedupe por `event.id` con upsert + constraint
  único (sin 500 por concurrencia), `payment_status` verificado antes de
  comparar montos, eventos no manejados caen en `default` silencioso.
- **§5 Fulfillment:** `FOR UPDATE` + transacción única (incluye el marcado de
  `processedAt`), idempotente por estado, compara monto contra el precio
  congelado antes de entregar, no revierte una `Solicitud` ya `PAGO_VALIDADO`
  ante eventos tardíos.
- **§7 Logs/PCI:** Checkout hospedado (SAQ A, sin PAN/CVC en el servidor
  propio); logs no serializan el `Event` completo ni `client_secret`.
- **§8 SCA:** no aplica — ver sección dedicada arriba.
- **§9 Disputas:** `charge.dispute.created` suscrito y alertado; `ip`/`userAgent`
  persistidos en la `Solicitud` al crear el checkout como evidencia.
- **§10 Infra:** llaves test y live nunca en el mismo `.env`; retención de
  `StripeEvent` a 90 días vía script de mantenimiento (mismo patrón que
  `vaciar.ts`), pendiente de decidir si se automatiza con cron.
- **§11 Pruebas mínimas:**
  1. `express.json()` global montado antes de la ruta del webhook rompe la
     verificación de firma (test de regresión de orden de middleware).
  2. Evento duplicado (mismo `event.id`, entrega concurrente o reintento)
     transiciona la solicitud una sola vez.
  3. Monto distinto a `precioCotizado` no avanza el estado (queda en
     `RECIBIDA` con observación).
  4. `payment_status !== 'paid'` no avanza el estado, incluso con
     `checkout.session.completed` recibido.

## Checklist de salida a llaves live

Nada de esto es código — son pasos manuales, fuera del repo, antes de cambiar
`STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` de test a live en producción:

- [ ] Turnstile (o CAPTCHA equivalente) activo en el formulario de compra.
- [ ] Reglas de Radar revisadas en el dashboard de Stripe: bloqueo por
      velocidad de intentos, protección de card testing, revisión por
      mismatch de CVC.
- [ ] `STRIPE_WEBHOOK_SECRET` de producción es un secreto **distinto** al que
      genera `stripe listen` en desarrollo — rotado/generado específicamente
      para el endpoint de prod en el dashboard.
- [ ] Verificación explícita de que el `.env` de producción (Railway) no
      contiene ninguna key `sk_test_` ni `whsec_` de test — revisar variable
      por variable, no solo "que funcione".
- [ ] Webhook endpoint de prod apunta a la URL real de la API (no a
      `localhost` ni a un túnel de desarrollo).
- [ ] Confirmar en el dashboard de Stripe que el evento `charge.dispute.created`
      está en la lista de eventos suscritos del webhook de producción (además
      de `checkout.session.completed` y `checkout.session.expired`).

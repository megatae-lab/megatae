# MEGATAE eSIM — Plan de construcción (Fase 3)

## Sprint 0 — Fundación del proyecto

**Objetivo:** Monorepo funcionando con BD conectada y datos iniciales listos.

**Componentes a construir:**
- pnpm workspaces: `apps/api` y `apps/web` con scripts `dev`, `build`
- `apps/api`: Express + Prisma + conexión a PostgreSQL (Docker Compose para dev local)
- `apps/web`: React + Vite + Tailwind configurado, página en blanco
- `schema.prisma` completo con todas las tablas del modelo de datos
- Migraciones iniciales
- Seed: planes vigentes (Bait $70, AT&T $70 y $150, Movistar $70 y $150), 2–3 cuentas bancarias de ejemplo, 1 admin PRO + 1 admin GENERAL
- `GET /api/health` — health check básico

**Resultado esperado:** `pnpm dev` levanta el API en el puerto 3001 y el frontend en 5173.
Un `GET /api/planes` devuelve los 5 planes del seed. La BD tiene todos los datos iniciales.
No hay UI real todavía — solo verificación técnica.

---

## Sprint 1 — Landing pública

**Objetivo:** El cliente puede ver la propuesta de valor y los planes disponibles.

**Componentes a construir:**
- Navbar (logo + links placeholder para secciones fuera de alcance)
- Hero: copy + imagen + formulario mínimo de inicio (nombre, email, teléfono, compañía) que redirige a `/comprar` con los datos como estado
- `GET /api/planes` ya existe desde Sprint 0 — renderizar las tarjetas de planes con precios y recargas
- Lead magnet: campo de email + `POST /api/leads` + checkbox de aceptación
- Stepper "¿Cómo obtener tu eSIM?" con el copy corregido (4 pasos, sin "asesor")
- Sección "¿Por qué te conviene tener eSIM?" (4 bullets estáticos)
- Lista/buscador de dispositivos compatibles (contenido estático desde el listado del cliente)
- Footer con placeholders de Términos y Condiciones / Aviso de Privacidad
- Banner CTA "Activa tu eSIM" (sticky o entre secciones, según diseño de referencia)

**Resultado esperado:** La landing completa, responsive, siguiendo el diseño de referencia
(`docs/assets/landing-diseno-referencia.png`). El botón "Me interesa" de cada tarjeta de plan
lleva a `/comprar` preseleccionando esa compañía. El formulario de lead magnet guarda el email en la BD.

---

## Sprint 2 — Flujo de compra + correo de confirmación

**Objetivo:** Un cliente puede completar una solicitud de principio a fin y recibe un correo de confirmación.

**Componentes a construir:**

*Backend:*
- `POST /api/solicitudes/presigned-url` — genera URL firmada en R2 para subir el comprobante
- `POST /api/solicitudes` — crea la solicitud (recibe JSON con campos + URL del comprobante ya subido)
- Template `SolicitudRecibida.tsx` (React Email): "Felicidades por tu compra, en un momento recibirás tu QR"
- Disparo del correo tras la creación exitosa de la solicitud

*Frontend — multi-step en `/comprar`:*
- Step 1 (`/comprar`): datos del cliente (nombre, email, teléfono) + selección de compañía y plan.
  Si la compañía es AT&T, aparece campo de ciudad y estado para asignar LADA.
- Step 2 (`/pago`): instrucciones de pago — primero se muestran las cuentas bancarias activas
  (consume `GET /api/cuentas-bancarias`) con opción de copiar número/CLABE; luego el campo
  de subida del comprobante (presigned URL → upload a R2 → POST con la URL resultante)
- Step 3 (`/gracias`): pantalla de confirmación con copy actualizado (sin mención de asesor)

**Resultado esperado:** Un cliente completa el flujo, recibe el correo de confirmación,
y la solicitud aparece en la BD con estado `RECIBIDA`. El comprobante está almacenado en R2.

---

## Sprint 3 — Autenticación del panel admin

**Objetivo:** Los 4 admins pueden autenticarse de forma segura y acceder al panel.

**Componentes a construir:**

*Backend:*
- `POST /api/auth/login` — bcrypt + JWT (expiración: 8h)
- Middleware de auth JWT aplicado a todas las rutas `/api/admin/*`
- Middleware de autorización por rol: las rutas marcadas como PRO only devuelven 403 si el admin es GENERAL

*Frontend:*
- Página de login `/admin/login`
- Persistencia del JWT en `localStorage` + interceptor en el cliente HTTP
- Redirect automático a `/admin/login` cuando el token expira o es inválido
- Logout (elimina el token, redirige a `/admin/login`)
- Layout base del panel (sidebar o navbar interna, placeholder de cola de solicitudes)

**Resultado esperado:** Los admins inician sesión. Las rutas `/admin/*` redirigen al login
si no hay sesión activa. Un admin GENERAL no puede acceder a acciones PRO. El admin PRO puede acceder a todo.

---

## Sprint 4 — Cola del admin + validación de pagos

**Objetivo:** La mesa de control puede ver las solicitudes y procesar el ciclo de validación de pago.

**Componentes a construir:**

*Backend:*
- `GET /api/admin/solicitudes?estado=X` — cola filtrada por estado, ordenada por `createdAt ASC`
- `GET /api/admin/solicitudes/:id` — detalle completo con historial de estados
- `PATCH /api/admin/solicitudes/:id/estado` — avanza o rechaza estado (valida contra `TRANSICIONES_VALIDAS`)
- Template `PagoRechazado.tsx` (React Email): incluye la observación del admin y próximos pasos para el cliente
- Disparo del correo cuando el estado pasa a `PAGO_RECHAZADO`

*Frontend:*
- Vista de cola `/admin/solicitudes`: pestañas o filtro lateral por estado. Cada fila muestra
  nombre, compañía, plan, tiempo transcurrido desde creación.
- Indicador visual para solicitudes que llevan más de 24h en un mismo estado (útil para `REVISION_PAGO` y `PAGO_RECHAZADO`)
- Vista de detalle `/admin/solicitudes/:id`:
  - Datos del cliente
  - Comprobante (imagen o link, con el monto esperado del plan para comparación visual)
  - Historial de estados con timestamps y admin responsable
  - Botones de acción según el estado actual:
    - `RECIBIDA` → botón "Iniciar revisión" (→ `REVISION_PAGO`)
    - `REVISION_PAGO` → botones "Validar pago" (→ `PAGO_VALIDADO`) y "Rechazar pago" (→ `PAGO_RECHAZADO`, abre modal con campo de observación obligatorio)
    - `PAGO_RECHAZADO` → botón "Cancelar solicitud" (→ `CANCELADA`)

**Resultado esperado:** Un admin GENERAL puede procesar el ciclo completo de validación de pago.
El cliente recibe correo con el motivo cuando se rechaza el pago.

---

## Sprint 5 — Activación y envío de QR

**Objetivo:** La mesa de control puede completar el ciclo de activación y el cliente recibe su QR.

**Componentes a construir:**

*Backend:*
- `POST /api/admin/solicitudes/:id/qr/presigned-url` — URL firmada para subir el QR a R2
- `POST /api/admin/solicitudes/:id/qr` — recibe `{ qrUrl, dn }`, avanza a `QR_ENVIADO`
- Template `QrEnviado.tsx` (React Email): imagen del QR, DN asignado, link al video tutorial,
  aviso de "tienes 24h para registrar tu línea con el operador" (copy ya pensado para Fase 2)
- Disparo del correo al crear el QR
- `PATCH /api/admin/solicitudes/:id/estado` ya cubre `QR_ENVIADO → ACTIVADA` y `QR_ENVIADO → CANCELADA`

*Frontend — en la vista de detalle, nuevas acciones según estado:*
- `PAGO_VALIDADO` → botón "Iniciar activación" (→ `EN_ACTIVACION`)
- `EN_ACTIVACION` → formulario: campo para subir la imagen del QR (presigned URL → R2) + campo de texto para el DN → botón "Enviar QR al cliente" (→ `QR_ENVIADO`)
- `QR_ENVIADO` → alerta si llevan más de 24h (facilita la revisión manual de LMTR) + botones "Confirmar activación" (→ `ACTIVADA`) y "Cancelar" (→ `CANCELADA`)
- Indicador visual en la cola para solicitudes en `QR_ENVIADO` con más de 24h

**Resultado esperado:** Flujo de activación completo end-to-end. El cliente recibe el correo
con el QR y el DN. La solicitud puede cerrarse como `ACTIVADA` o `CANCELADA`.

---

## Sprint 6 — Configuración del admin (planes y cuentas bancarias)

**Objetivo:** El negocio puede actualizar el catálogo y las cuentas bancarias sin tocar código.

**Componentes a construir:**

*Backend:*
- `GET /api/admin/planes` — todos los planes incluyendo inactivos (PRO y GENERAL)
- `POST /api/admin/planes` — crear plan (PRO only)
- `PATCH /api/admin/planes/:id` — editar precio, recarga, descripción, activo (PRO only)
- `GET /api/admin/cuentas-bancarias` — todas las cuentas (PRO y GENERAL)
- `POST /api/admin/cuentas-bancarias` — crear cuenta (PRO only)
- `PATCH /api/admin/cuentas-bancarias/:id` — editar banco, titular, cuenta, CLABE, activo, orden (PRO only)

*Frontend (solo accesible para admin PRO):*
- Vista `/admin/planes`: tabla con todos los planes, toggle activo/inactivo, botón de edición inline o modal, botón de crear nuevo plan
- Vista `/admin/cuentas`: lista de cuentas con orden drag-or-arrow, toggle activo/inactivo, edición inline o modal

**Resultado esperado:** El admin PRO puede actualizar el catálogo de planes y las cuentas bancarias.
Los cambios se reflejan inmediatamente en la landing (tarjetas de planes) y en el Step 2 del flujo
de compra (cuentas bancarias mostradas al cliente).

---

## Sprint 7 — SIRED adapter + hardening

**Objetivo:** El sistema maneja errores básicos, abuso y deja la integración SIRED lista para swap.

**Componentes a construir:**

*SIRED:*
- Interfaz `SiredAdapter` con método `reportarVenta(solicitudId, dn, compania)`
- `StubSiredAdapter`: loggea la llamada y devuelve `{ ok: true }`
- Trigger: cuando una solicitud pasa a `ACTIVADA`, se llama al adapter
- El adapter se instancia como dependencia inyectada en el servicio de solicitudes

*Hardening:*
- Rate limiting en rutas públicas (`/api/solicitudes`, `/api/leads`) con `express-rate-limit`
- Validación de tipo MIME (solo `image/jpeg`, `image/png`, `application/pdf`) y tamaño máximo (5 MB) en la generación de presigned URLs
- Logs estructurados con `pino` (JSON en producción, pretty en desarrollo)
- Manejo global de errores no capturados (Express error handler + log)
- `.env.example` con todas las variables necesarias documentadas
- `docker-compose.yml` para levantar PostgreSQL en dev local

**Resultado esperado:** El sistema loggea sus operaciones, rechaza archivos inválidos,
y tiene protección básica contra spam en rutas públicas. La integración SIRED está completamente
aislada — cuando la API real esté disponible, solo se swapea la implementación del adapter
sin tocar ningún otro archivo.

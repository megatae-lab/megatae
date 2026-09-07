# Progreso del proyecto — MEGATAE eSIM

## Estado actual

**Fase 1 (Entender el producto): completada.** Ver `docs/PRODUCT_BRIEF.md`
para el resultado completo del discovery con el cliente.

**Fase 2 (Diseño del sistema): completada.** Ver `docs/ARCHITECTURE.md`
para el resultado completo.

**Fase 3 (Plan de construcción): completada.** Ver `docs/SPRINTS.md`
para el plan de 8 sprints. Pendiente confirmación de Edgar para arrancar Fase 4.

**Fase 4 — Sprint 0 (Fundación): completado.** Monorepo, schema, seed, endpoints de verificación listos.

**Fase 4 — Sprint 1 (Landing pública): completado.** Landing con todas las secciones: Hero + formulario, tarjetas de planes (vivas desde la BD), lead magnet, stepper, beneficios, buscador de dispositivos, tiendas. Endpoint POST /api/leads operativo.

**Fase 4 — Sprint 2 (Flujo de compra) — Backend: completado.** GET /api/cuentas-bancarias, POST /api/solicitudes/presigned-url, POST /api/solicitudes. Servicio R2 (presigned URLs). Resend + template SolicitudRecibida.tsx. LADA validada en backend: requerida para ATT, forzada a "55" para Movistar/Bait.

**Fase 4 — Sprint 2 Frontend: completado.** Flujo multi-step: Comprar.tsx (datos + compañía + plan + LADA AT&T), Pago.tsx (cuentas bancarias con copy + upload a R2 + POST /api/solicitudes), Gracias.tsx (confirmación con número de solicitud). Stepper compartido. Guards: /pago y /gracias redirigen a / si no hay estado.

**Fase 4 — Sprint 3 (Auth admin): completado.** POST /api/auth/login (bcrypt + JWT 8h). Middleware requireAuth + requirePro aplicado a /api/admin/*. Frontend: /admin/login, AdminLayout (sidebar con logout, nav por rol), AdminDashboard placeholder. JWT en localStorage, redirect automático a /admin/login si token inválido/ausente.

**Fase 4 — Sprint 4 (Cola admin + validación pagos): completado.** GET /api/admin/solicitudes, GET /api/admin/solicitudes/:id, PATCH /api/admin/solicitudes/:id/estado con mapa de transiciones válidas. Email PagoRechazado. Frontend: cola con 8 tabs y badge de conteo, indicador >24h, vista de detalle con comprobante + monto esperado + historial + acciones por estado. Modal de rechazo con observación requerida.

**Fase 4 — Sprint 5 (Activación y envío de QR): completado.** POST /api/admin/solicitudes/:id/qr/presigned-url (solo admin, valida estado EN_ACTIVACION, acepta JPG/PNG), POST /api/admin/solicitudes/:id/qr (guarda qrUrl + dn, transiciona a QR_ENVIADO, envía email QrEnviado). Email QrEnviado.tsx con imagen del QR, DN, aviso de 24h LMTR, y link a tutorial de video opcional (VIDEO_TUTORIAL_URL en .env). Frontend: AccionesEstado extendido para PAGO_VALIDADO (→ EN_ACTIVACION), EN_ACTIVACION (upload QR + DN inline), QR_ENVIADO (alerta 24h + Confirmar/Cancelar). Vista de detalle muestra card con QR preview y DN cuando ya existen.

**Fase 4 — Sprint 6 (Configuración admin): completado.** GET/POST/PATCH /api/admin/planes (PRO only para escritura), GET/POST/PATCH /api/admin/cuentas-bancarias + POST /reorder (PRO only). Frontend: /admin/configuracion con tabs Planes y Cuentas. Toggle activo inline, modales de crear/editar, reordenamiento por flechas (up/down) en cuentas. Bloqueo de acceso a GENERAL con mensaje en UI.

**Fase 4 — Sprint 7 (SIRED + hardening): completado.** SiredAdapter interface + StubSiredAdapter (loggea y devuelve ok:true). Trigger fire-and-forget en transición a ACTIVADA. Rate limiting: 20 req/15min en /api/leads y /api/solicitudes, 10 req/15min en /api/auth. Validación 5 MB en cliente (Pago.tsx y SolicitudDetalle.tsx). .env.example actualizado con VIDEO_TUTORIAL_URL.

**Fase 4: COMPLETA. Todos los sprints 0-7 implementados.**

**Addendum post-entrega — Pasarela Stripe, Iteración 1 (backend): completada.**
Diseño en la sección "Addendum — Pasarela Stripe" de `docs/ARCHITECTURE.md`,
validado contra `docs/STRIPE_SECURITY_CHECKLIST.md` (checklist aportado por
Edgar). Migración de BD en 2 pasos aplicada en local (`add_stripe_payment` +
`add_public_code_not_null`, con `pnpm db:backfill-public-code` corrido entre
medio — 23 solicitudes existentes backfilleadas). Nuevo modelo `StripeEvent`
para idempotencia de webhook; `Solicitud` gana `publicCode`, `metodoPago`,
`precioCotizado`, `stripeSessionId`, `accessToken`, `accessTokenExpiresAt`,
`ip`, `userAgent`. Endpoints nuevos: `POST /api/solicitudes/stripe/checkout`,
`POST /api/stripe/webhook` (checkout.session.completed/expired,
charge.dispute.created), `GET /api/solicitudes/by-token/:accessToken`,
`POST /api/solicitudes/consultar`. Folio público (`publicCode`, prefijo `MT-`)
sustituye al `id` en emails y consulta de estado; `id` interno se conserva
solo en rutas admin. Validación de entorno al arranque (falla si falta
`STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`, o si hay una llave `sk_test_`
con `NODE_ENV=production`). Probado localmente end-to-end: flujo de
transferencia, `consultar`, `by-token`, verificación de firma del webhook, y
manejo de error de Stripe (limpieza de la Solicitud huérfana si el Checkout
Session nunca se crea) — todo contra la BD local, con llaves de Stripe
ficticias (no se hizo ninguna llamada real a la API de Stripe).

Pendiente antes de poder probar el flujo de pago real: Edgar debe generar sus
llaves de test en el dashboard de Stripe y ponerlas en `apps/api/.env`
(`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — esta última normalmente sale
de correr `stripe listen --forward-to localhost:3001/api/stripe/webhook` en
local). Sin esas dos variables, `pnpm dev` de la API no arranca (a propósito).

Siguiente: Iteración 2 (frontend) — botón "Pagar con tarjeta" en `Pago.tsx`,
`Gracias.tsx` adaptado para aceptar el retorno de Stripe vía `?token=`, y
pantalla de "consultar mi solicitud" (folio + correo).

**Pruebas mínimas del §11 del checklist: escritas y pasando.** Se agregó
`vitest` + `supertest` como devDependencies (no había framework de pruebas en
el proyecto). `apps/api/src/routes/stripeWebhook.test.ts` cubre las 4:
orden de middleware rompe la firma, evento duplicado transiciona una sola
vez, monto distinto a `precioCotizado` no avanza, `payment_status` distinto
de `paid` no avanza. Corren contra la BD local (`pnpm test` en `apps/api`),
sin llamar a la API real de Stripe (firma generada y verificada localmente).
Confirmado que no dejan filas huérfanas (`Solicitud`/`StripeEvent` de prueba
se limpian en `afterEach`).

**Probado end-to-end con Stripe real (modo test), no solo mocks.** Edgar
generó sus llaves de test y el webhook secret local (`stripe listen`, CLI
instalado vía winget). Se creó un Checkout Session real, se pagó con tarjeta
de prueba `4242...` en el navegador, el webhook llegó firmado y correcto, y la
`Solicitud` quedó en `PAGO_VALIDADO` con `historial` de una sola entrada
("Confirmado automáticamente vía Stripe") y `stripeSessionId` correlacionado.
Datos y procesos de prueba limpiados después. Iteración 1 (backend): cerrada.

**Iteración 2 (frontend): completada.** `Pago.tsx` gana un botón "Pagar con
tarjeta" (llama a `/solicitudes/stripe/checkout` y hace redirect completo a
Stripe) junto al flujo de transferencia existente — mismo panel, `divisor "o
transferencia"` entre ambos, error de tarjeta y error de transferencia en
estados separados para no pisarse. `Gracias.tsx` ahora acepta dos entradas:
`location.state` (transferencia, sin cambios de comportamiento) o `?token=`
en la URL (retorno de Stripe) — en ese segundo caso hace polling corto
(hasta 5 intentos, 1.5s) a `GET /solicitudes/by-token/:token` porque el
redirect de Stripe puede llegar antes que el webhook termine de procesar; si
se agotan los intentos, no truena — informa que el pago se está confirmando
y linkea a la nueva pantalla de consulta. Nueva ruta pública `/consultar`
(`Consultar.tsx`) para folio + correo, con copy orientado al cliente por
estado (distinto del copy operativo del admin). Folio (`publicCode`)
reemplaza al `id` numérico en toda la UI pública y en el panel admin
(lista y detalle) — `id` interno solo se sigue usando para la navegación de
rutas admin (`/admin/solicitudes/:id`). Se corrigió un bug real que este
mismo cambio de schema introducía: `SolicitudDetalle.tsx` asumía
`comprobante` siempre presente (imagen, descarga, modal); ahora renderiza
una tarjeta "Pagado con tarjeta vía Stripe" cuando es nulo, y las acciones
que dependen del archivo quedan guardadas. Reporte Excel de admin
(`reportes.ts`) gana columna "Método de pago". `tsc --noEmit` limpio en
`apps/api` y `apps/web`; suite de Stripe (`pnpm test` en `apps/api`) sigue
en verde.

Pendiente antes de dar por cerrado el módulo completo: decidir si
`/consultar` se enlaza desde algún otro lugar del sitio (hoy solo se llega
ahí por el fallback de `/gracias` o escribiendo la URL directo).

**Rediseño del flujo de compra (post Iteración 2), a petición de Edgar:**

- **Fusión de pasos 1 y 2.** `Comprar.tsx` ya no navega a `/pago` — en cuanto
  compañía + plan + LADA (si AT&T) + nombre + correo son válidos, la sección
  de pago aparece inline debajo, sin botón de submit intermedio (progresiva,
  reactiva). Se extrajo `PagoSeccion.tsx` con esa lógica, parametrizada por
  props en vez de `location.state`. Ruta `/pago` y su archivo se eliminaron;
  `cancel_url` de Stripe ahora regresa a `/comprar?stripe=cancelado` (pierde
  el branding de la landing de compañía si el checkout se inició desde ahí —
  simplificación aceptada, caso de borde). Stepper pasa de 3 pasos a 2:
  "Datos y pago" → "Confirmación".
- **Mercado Pago retirado por completo** — botón, lógica y
  `VITE_MERCADOPAGO_URL` eliminados de código y `.env`/`.env.example`.
- **Transferencia bancaria detrás de feature flag.** `VITE_TRANSFERENCIA_HABILITADA`
  (`apps/web/lib/features.ts`) apaga desde el front, sin borrar código: la
  sección de cuentas + upload de comprobante en `PagoSeccion.tsx`, y la
  pestaña "Cuentas bancarias" en `/admin/configuracion`. Hoy está en `false`
  en `apps/web/.env` — reactivar con `true` requiere rebuild/restart (Vite
  hornea env vars al arrancar, no hay hot-reload de eso).
- **"Resumen de tu compra"** agregado dentro de `PagoSeccion.tsx`, debajo del
  título "Realiza tu pago" — compañía, GB/días, recarga, precio y bullets de
  descripción, como recordatorio justo antes de pagar (el selector de plan
  puede estar fuera de vista a esa altura de la página).
- **Probado end-to-end en la UI real** (no solo API): `/comprar` → completar
  datos → aparece pago inline con resumen → "Pagar con tarjeta" → Stripe
  hospedado con tarjeta de prueba → `/gracias`. Solicitud `MT-KD66EZPLZE`
  (Movistar, $150) confirmada en BD: `PAGO_VALIDADO`, historial correcto,
  `ip`/`userAgent` capturados. Confirmado con Edgar que el redirect a
  `checkout.stripe.com` (misma pestaña, no una nueva) se queda así — no se
  va a migrar a Embedded Checkout por ahora.

**Fase 6 (Entrega): completada.** railway.toml con build/start/healthcheck, vercel.json con SPA fallback, api.ts con soporte VITE_API_URL para cross-origin en producción, vite-env.d.ts para tipos. Guía de deploy en docs/DEPLOY.md: PostgreSQL en Railway, API con variables de entorno, Vercel con VITE_API_URL, R2 CORS para dominio Vercel, dominio custom, checklist post-deploy, instrucciones de mantenimiento y extensión a Fase 2.

## Decisiones ya tomadas (no volver a preguntar)

- Solo AT&T, Movistar y Bait. Solo líneas nuevas, sin portabilidad.
- LADA seleccionable solo para AT&T; Movistar y Bait fijos en 55.
- No existe "pendiente de pago" como estado separado — el comprobante va
  en el mismo formulario de compra.
- No hay asesor humano en el flujo — todo automatizado salvo la validación
  de pago y la activación en el sistema de la compañía (ambas hechas por
  mesa de control).
- El QR se digitaliza manualmente por mesa de control; el DN se captura
  como campo de texto junto con el QR (no se puede depender solo del
  contenido de la imagen).
- SIRED se integra por API a futuro — por ahora, stub/mock.
- Pago: depósito manual, cuentas bancarias editables desde el admin.
- Roles: 1 admin pro (control total) + 3 admin general (validan pagos,
  suben QR/DN, envían correos).
- Fase 2 (rifa) queda fuera de esta implementación, pero el modelo de
  datos debe dejar espacio para ella (boleto ligado a la venta, gate por
  validación LMTR confirmada a las 24h).

## Decisiones tomadas en Fase 3 (no volver a preguntar)

- Deploy: Cloudflare R2 para archivos, Railway/Render para API, Vercel para web.
- 8 sprints: 0 Fundación → 1 Landing → 2 Flujo de compra → 3 Auth admin → 4 Cola + validación pagos → 5 Activación + QR → 6 Configuración admin → 7 SIRED + hardening.
- En el Step 2 del flujo de compra: primero se muestran las cuentas bancarias, luego el upload del comprobante.

## Decisiones tomadas en Fase 2 (no volver a preguntar)

- Stack: React + Vite + Tailwind (web), Node.js + Express + Prisma (api), PostgreSQL.
- Monorepo con pnpm workspaces: apps/web y apps/api.
- Almacenamiento de archivos: Cloudflare R2 con presigned URLs (subida directa desde browser).
- Autenticación admin: JWT + bcrypt (sin servicio externo).
- State machine de solicitud: 8 estados, transiciones validadas en backend con mapa explícito.
- Campo ciudad/estado del cliente nombrado `estadoMx` para no colisionar con `estado` del flujo.
- SIRED: interfaz `SiredAdapter` con stub; swap sin refactor cuando llegue la API real.
- 3 templates de correo en React Email: SolicitudRecibida, PagoRechazado, QrEnviado.
- Panel admin: cola filtrada por estado con React Query (no WebSocket — volumen no lo justifica).
- Apertura Fase 2: tabla `Boleto` se agrega sin tocar el modelo existente; gate calculado desde HistorialEstado.

## Pendientes menores (no bloquean Fase 3)

- Recarga exacta del plan Movistar $150 (dato ambiguo en el discovery).
- Confirmar si se permite reintento de pago rechazado sin perder datos ya capturados.
- Documentación real de la API de SIRED cuando esté disponible.

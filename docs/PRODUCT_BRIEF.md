# MEGATAE — Plataforma de venta y activación de eSIM

## Contexto del negocio

MEGATAE es distribuidor autorizado de eSIM (convenio con AT&T, Movistar, Bait).
Vende líneas **nuevas** de eSIM (no portabilidad). La validación de identidad
LMTR (CURP + identificación + selfie/prueba de vida) es responsabilidad del
cliente directamente con el operador — MEGATAE no la captura ni la gestiona.

Este es el entregable de **Fase 1**: landing pública + panel administrativo.
Fase 2 (futuro, no implementar aún) agrega un módulo de rifa: cada eSIM
vendida entrega un boleto aleatorio, condicionado a que el cliente complete
su validación LMTR con el operador.

Referencia de diseño previo: plataforma Rifadísimos (mismo stack, mismo
patrón de validación manual de pagos por mesa de control).

## Stack

Node.js + React + Prisma + base de datos relacional (Postgres/MySQL, a
definir). Correcorreo transaccional vía **Resend**.

## Compañías y restricción de LADA

Solo estas tres, solo líneas nuevas:

| Compañía | LADA |
| --- | --- |
| AT&T | El cliente **elige** su LADA (campo visible solo si elige AT&T) |
| Movistar | Fija en 55, no se pregunta |
| Bait | Fija en 55, no se pregunta |

No hay combos ni planes de portabilidad. Si en el futuro se agrega
portabilidad, es un producto distinto con campos adicionales (número a
portar, NIP) — fuera de alcance de fase 1.

## Catálogo de planes

Tabla `Plan`: `compania | precio | recarga | descripcion | activo`.

Planes vigentes al momento del discovery (cambian mensualmente por promociones
de sorteo, administrados por el área de ventas — deben ser editables sin
tocar código):

- Bait: $70 (incluye recarga $100)
- AT&T: $70 (incluye recarga $100) / $150 (incluye recarga $200)
- Movistar: $70 (incluye recarga $100) / $150 (recarga a confirmar con
  cliente, dato ambiguo en el discovery)

Un plan se puede des-publicar/pausar sin borrar, salvo que esté ligado a
un permiso de sorteo vigente ante SEGOB (esos no se pausan a mitad del
periodo autorizado).

## Formulario público (landing)

Campos capturados:
- Nombre completo
- Correo electrónico (donde llega el QR y, a futuro, el boleto)
- Número de contacto
- Ciudad y estado (para asignar LADA — solo aplica a AT&T)
- Compañía deseada (AT&T / Movistar / Bait)
- Comprobante de pago (archivo)

Sección aparte, independiente del formulario de compra: captura de email
para "desbloquea una promoción especial" (lead magnet). Se guarda en tabla
separada, **no se une automáticamente** con el registro completo aunque
sea el mismo correo — es exclusivamente para marketing futuro (ganchos de
sorteo). No bloquea ni se relaciona con ninguna venta.

Secciones del nav (Inicio, Vende Recargas, Registra tu Línea, Conócenos,
Ser socio) están **fuera de alcance de Fase 1** — solo se construye el
flujo de venta de eSIM.

### Copy del stepper "¿Cómo obtener tu eSIM?"

Corregido (ya no menciona asesor, porque no existe ese rol):

1. Regístrate y elige tu compañía
2. Realiza tu pago y adjunta comprobante
3. Validamos tu pago
4. Recibe tu eSIM por correo

### Compatibilidad de dispositivo

Se muestra una lista estática de modelos compatibles (fuente: documento
"Lista actualizada eSIM 2025" — iPhone desde XR/XS, iPads, Samsung Galaxy
S/Note/Fold/Flip/A/XCover, Google Pixel, Huawei, Oppo, Sony, Xiaomi,
Motorola, Sharp, Rakuten, Honor, Vivo). No hay validación real contra IMEI;
es una tabla/buscador informativo, el cliente autodeclara compatibilidad.

## Flujo de estados de la solicitud

No existe un estado "pendiente de pago" independiente — el comprobante es
parte del mismo formulario de compra. Nada llega a mesa de control hasta
que la solicitud está completa con pago incluido.

1. **Solicitud recibida** — formulario completo + comprobante enviados.
   Dispara correo automático: "Felicidades por tu compra, en un momento
   recibirás tu QR."
2. **Revisión de pago** — mesa de control compara el comprobante contra el
   precio esperado del plan (validación visual/manual, el sistema solo
   muestra el monto esperado junto al comprobante para comparar).
3. Rama A — **Pago rechazado**: mesa de control anota una observación,
   se envía por correo al cliente. Si no se autentica el pago en 24h →
   pasa a Cancelada.
4. Rama B — **Pago validado**: pasa a cola de activación.
5. **En activación** — mesa de control entra al sistema de la compañía y
   activa/registra la eSIM ahí (paso manual, no automatizable — aunque
   haya inventario físico de QRs, cada eSIM requiere alta en el sistema
   de la compañía). Digitaliza el QR físico (tarjeta) a un formato
   presentable.
6. **QR enviado** — mesa de control sube el **QR (imagen) y el DN
   (número asignado, campo de texto capturado a mano)** en la misma
   acción del admin. Dispara correo: QR + video tutorial (mp4 hospedado
   en servicio externo tipo el usado en Rifadísimos) + aviso de "24h
   para registrar tu línea" (relevante para elegibilidad de boleto en
   fase 2).
7. **Activada** — a las 24h, mesa de control verifica manualmente el DN
   contra el sistema de la compañía para confirmar que el registro LMTR
   se completó. Se captura la venta exitosa en SIRED (ver abajo). En
   fase 2, este es el punto que libera el boleto de rifa.
8. **Cancelada** — no se autenticó el pago en 24h, u otro motivo manual.

No hay reintento dentro del mismo registro tras un rechazo — si no se
autentica en 24h, se cancela directo (confirmar si en el futuro se permite
reintentar sin perder los datos ya capturados).

## Pago

- Depósito bancario manual, sin pasarela de pago por ahora.
- El admin muestra cuentas bancarias (banco, titular, cuenta/CLABE) que
  **deben ser editables** desde el panel — el cliente indicó que los
  bancos a veces bloquean cuentas sin aviso y necesitan poder cambiarlas
  rápido.
- El comprobante se conserva indefinidamente (mínimo hasta el día del
  sorteo correspondiente — sujeto a revisión de SEGOB).
- La misma persona que valida el pago es quien más adelante marca la
  solicitud como avanzada en el flujo (no hay separación estricta de
  roles entre "valida pago" y "activa").

## SIRED

Sistema interno de inventario/ventas de MEGATAE. Se integra por API una
vez finalizada la venta (estado Activada). **Por ahora se implementa como
stub/mock** — el cliente construirá su lado de la API más adelante;
dejar la interfaz de integración claramente definida y aislada
(ej. un adapter/servicio) para no tener que refactorizar cuando la API
real esté lista.

## Roles y operación del panel admin

- **1 admin "pro"** (la dueña del negocio) — control total, incluye
  ingresos y reportes financieros.
- **3 admin "general"** — validan pagos, suben QR/DN, envían los correos
  correspondientes. Mismo rol para todas (no hay separación entre
  "valida pago" y "activa" como roles distintos).

El panel debe funcionar como **cola de trabajo por estado** (qué solicitudes
están en revisión de pago, cuáles llevan más de 24h en activación, etc.),
no como un CRUD genérico de tabla plana.

## Volumen esperado

Entre decenas y cientos de solicitudes por semana al lanzar, escalando con
inversión en marketing. Referencia regulatoria: el trámite ante SEGOB
autoriza 1,500 ventas en 45 días (no se conoce el promedio diario exacto).

## Fase 2 (no implementar aún, solo dejar la arquitectura abierta)

- Cada eSIM vendida (sin importar plan o compañía) entrega un boleto de
  rifa aleatorio — el cliente no elige número.
- El boleto se libera solo si el cliente completó su validación LMTR con
  el operador. Por ahora la única forma de confirmarlo es la verificación
  manual de 24h que ya hace mesa de control sobre el DN (no hay webhook
  ni notificación automática del operador).
- El correo de "QR enviado" ya avisa al cliente que tiene 24h para
  registrar su línea y así recibir su boleto — ese copy ya está pensado
  para fase 2 aunque el módulo de rifa no exista todavía.

## Fuera de alcance de Fase 1

- Portabilidad de línea.
- Navegación completa del sitio (Vende Recargas, Registra tu Línea,
  Conócenos, Ser socio) — solo se construye el flujo de venta de eSIM.
- Términos y Condiciones / Aviso de Privacidad — el cliente los entregará
  en PDF; usar placeholder mientras tanto.
- Integración real de pasarela de pago.
- Integración real de SIRED (queda mockeada).

## Pendientes / a confirmar con el cliente

- Documentación real de la API de SIRED cuando esté disponible.
- Confirmar recarga exacta del plan Movistar de $150 (dato ambiguo en el
  discovery).
- Confirmar si en el futuro se permite reintentar un pago rechazado sin
  perder los datos ya capturados en la solicitud.

## Referencias visuales

Ver `docs/assets/`:

- `landing-diseno-referencia.png` — captura del diseño final esperado por
  el cliente (nav real, 5 tarjetas de planes, stepper, secciones). Es la
  referencia más cercana a "cómo se debe ver" la landing. **Nota:** el
  combo Movistar+AT&T y el plan Bait Portabilidad que aparecen ahí **no**
  se implementan en Fase 1 — ver sección "Compañías y restricción de
  LADA" arriba. El stepper de esta imagen también trae el copy viejo
  ("un asesor se comunicará contigo") — usar el copy corregido de este
  documento, no el de la imagen.
- `wireframe-landing-01.png` — wireframe original de baja fidelidad
  (referencia de estructura, no de estilo visual).
- `wireframe-landing-02-frankenstein.png` — collage de páginas de
  referencia que el cliente armó para dar una idea de estilo; **no** es
  un diseño final, solo inspiración de estilo visual.
- `wireframe-pago.png` — página de captura de comprobante de pago
  (cuentas bancarias).
- `wireframe-recibimos-info.png` — pantalla de confirmación
  "Recibimos tu información" (copy a actualizar, ya no hay asesor).
- `lista-dispositivos-compatibles.docx` — listado completo de modelos
  compatibles con eSIM (fuente para la sección de compatibilidad de
  dispositivo).

# Checklist de validación — Integración Stripe (Node + TypeScript + React)

Cada punto está redactado como una verificación con criterio de falla explícito.
Uso previsto: pegar en `docs/` del repo y correrlo como pase de revisión.

---

## 1. Claves y configuración

- [ ] `sk_live_*` / `sk_test_*` no aparecen en ningún archivo versionado, snapshot de test, fixture ni `.env.example`.
- [ ] El bundle del cliente no contiene ninguna variable que no empiece con el prefijo público del bundler (`VITE_`, `NEXT_PUBLIC_`). Verificar contra el build real, no contra el código fuente.
- [ ] Existe validación de entorno en el arranque (zod o equivalente) que falla si `NODE_ENV=production` con una key `sk_test_`.
- [ ] `apiVersion` está fijada explícitamente al instanciar el cliente de Stripe.
- [ ] El webhook secret de producción y el de `stripe listen` son distintos y viven en secretos separados.
- [ ] Se usan restricted API keys por servicio donde aplique, en vez de la secret key global en todos los procesos.
- [ ] No hay claves hardcodeadas en Dockerfiles, workflows de CI, ni variables de build.

## 2. Frontera cliente / servidor

- [ ] Ningún endpoint acepta `amount`, `currency`, `price_id` ni descuentos provenientes del request body.
- [ ] El total se recalcula server-side desde la base de datos en cada creación de intent.
- [ ] El `client_secret` solo se devuelve al dueño autenticado del recurso, nunca en query strings, logs ni respuestas de listados.
- [ ] La pantalla de éxito consulta el estado de la orden en el backend propio; no confía en `payment_intent_client_secret` ni en `redirect_status` de la URL.
- [ ] No existe ninguna ruta que marque una orden como pagada a partir de una petición del cliente.

## 3. Creación del PaymentIntent

- [ ] Requiere sesión autenticada.
- [ ] Verifica ownership del recurso (`findOwnedBy`, no `findById`).
- [ ] Valida que la orden esté en un estado pagable; rechaza si ya fue pagada o cancelada.
- [ ] Pasa `idempotencyKey` derivado de una entidad estable (`order:<id>:v<version>`), no un UUID aleatorio por request.
- [ ] Escribe `order_id` en `metadata` para poder correlacionar el webhook.
- [ ] `metadata` no contiene PII sensible (correo, teléfono, CURP, dirección completa).

## 4. Webhook

- [ ] La ruta del webhook recibe el body como `Buffer` (`express.raw`) y está montada **antes** de cualquier `express.json()` global.
- [ ] Se llama `stripe.webhooks.constructEvent` con la firma y el secret; no hay ninguna rama que parsee el evento sin verificar.
- [ ] Falla cerrado: firma inválida o ausente devuelve 400 sin exponer detalles del error.
- [ ] No hay lógica de negocio antes de la verificación de firma.
- [ ] No se usa IP allowlist como sustituto de la verificación de firma.
- [ ] Idempotencia por `event.id` con unique constraint en base de datos, no con un `SELECT` previo ni con caché en memoria.
- [ ] Responde 2xx antes de procesar (o el procesamiento está garantizado bajo el timeout de Stripe).
- [ ] Los tipos de evento no manejados caen en un `default` silencioso, sin lanzar error ni devolver 5xx.
- [ ] El endpoint no está detrás de auth de sesión ni de CSRF (rompería la entrega) pero tampoco expone nada más.
- [ ] Ningún proxy o gateway intermedio reescribe el body antes de llegar al handler.

## 5. Fulfillment y concurrencia

- [ ] La entrega ocurre únicamente desde `payment_intent.succeeded` o `checkout.session.completed` con `payment_status === 'paid'`.
- [ ] El handler toma lock de fila (`FOR UPDATE`) sobre la orden dentro de una transacción.
- [ ] Es idempotente a nivel de negocio: si la orden ya está `FULFILLED`, retorna sin efectos.
- [ ] Compara `amount_received` y `currency` contra la orden y manda a revisión manual si no coinciden, en lugar de entregar.
- [ ] Tolera eventos fuera de orden (un `payment_failed` posterior no debe revertir una entrega ya confirmada por error).
- [ ] Los efectos externos (envío de correo, aprovisionamiento) son idempotentes o quedan fuera de la transacción con reintento seguro.

## 6. Abuso y antifraude

- [ ] Rate limiting por IP y por usuario en el endpoint de creación de intents.
- [ ] CAPTCHA o Turnstile en el checkout si es accesible sin cuenta.
- [ ] Reglas de Radar activas: bloqueo por velocidad de intentos, protección de card testing, revisión por mismatch de CVC.
- [ ] Existe alerta sobre tasa anómala de declines o de creación de intents.
- [ ] La entrega de bienes digitales tiene un umbral o revisión para órdenes de riesgo alto.

## 7. Datos sensibles, PCI y logs

- [ ] Todos los datos de tarjeta se capturan con Payment Element / Checkout; ningún PAN, CVC ni fecha de expiración pasa por el servidor propio.
- [ ] No hay tablas ni columnas que almacenen datos de tarjeta, ni cifrados.
- [ ] Los logs no serializan el objeto `Event` completo, el `client_secret`, ni headers de autorización.
- [ ] Los errores devueltos al cliente no incluyen mensajes crudos de la API de Stripe.
- [ ] Sentry u otro APM tiene scrubbing configurado para `client_secret`, `stripe-signature` y campos de pago.

## 8. Manejo de estados y SCA

- [ ] Se maneja `requires_action` explícitamente; no se asume que `create` o `confirm` implican pago exitoso.
- [ ] Se manejan `processing` y `requires_payment_method` con UI y estado de orden diferenciados.
- [ ] Para pagos off-session, existe flujo de recuperación ante `payment_intent.requires_action`.
- [ ] Los errores de red hacia Stripe no dejan la orden en estado ambiguo: hay reconciliación por `retrieve` o por webhook.

## 9. Reembolsos y disputas

- [ ] Los reembolsos exigen autorización de rol y quedan en bitácora de auditoría con actor y motivo.
- [ ] Los reembolsos usan `idempotencyKey`.
- [ ] Se persisten IP, user agent, timestamp de aceptación de términos y evidencia de entrega por orden, para responder contracargos.
- [ ] `charge.dispute.created` está suscrito y genera alerta.

## 10. Infraestructura

- [ ] TLS obligatorio y HSTS en el dominio del checkout.
- [ ] Secretos en gestor de secretos, no en archivos del repositorio ni en variables de build del cliente.
- [ ] Los entornos de test y live no comparten base de datos ni cola.
- [ ] La tabla de eventos de webhook tiene política de retención y no crece sin control.

## 11. Pruebas que deben existir

- [ ] Firma inválida devuelve 400 y no ejecuta lógica de negocio.
- [ ] Evento duplicado (mismo `event.id`) entrega una sola vez.
- [ ] Dos entregas concurrentes del mismo `payment_intent.succeeded` producen un solo fulfillment.
- [ ] Intent con monto distinto al de la orden no entrega y marca revisión.
- [ ] Creación de intent sobre una orden ajena devuelve 403.
- [ ] Body parseado como JSON antes del handler rompe la firma (test de regresión del orden de middleware).
- [ ] `stripe events resend <id>` en local no duplica la entrega.

---

## Anti-patrones a buscar en el diff

Búsquedas rápidas que suelen encontrar fallas reales:

```
grep -rn "sk_live\|sk_test" --include="*.ts" --include="*.tsx" --include="*.json" .
grep -rn "req.body.amount\|body.price\|body.currency" src/
grep -rn "express.json()" src/ # verificar que no precede a la ruta del webhook
grep -rn "constructEvent" src/ # debe existir exactamente en un lugar
grep -rn "JSON.parse(req.body)" src/
grep -rn "redirect_status\|payment_intent_client_secret" src/ # no debe decidir fulfillment
grep -rn "client_secret" src/ --include="*.ts" # revisar que no se loguee
```

## Prompt sugerido para Claude Code

> Revisa la integración de Stripe contra `docs/STRIPE_SECURITY_CHECKLIST.md`.
> Para cada punto, responde: cumple / no cumple / no aplica, citando archivo y línea.
> No modifiques código todavía. Al final, ordena los incumplimientos por severidad
> (pérdida monetaria directa, entrega indebida, fuga de datos, robustez) y propón
> el diff mínimo para los tres primeros.

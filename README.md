# MEGATAE eSIM

Plataforma de venta y activación de eSIM (AT&T, Movistar, Bait) — landing
pública + panel administrativo. Monorepo pnpm: `apps/api` (Node/Express/Prisma)
y `apps/web` (React/Vite).

Contexto de producto, arquitectura y decisiones ya tomadas: ver `docs/`
(`PRODUCT_BRIEF.md`, `ARCHITECTURE.md`, `PROGRESS.md`). Guía de despliegue a
producción: `docs/DEPLOY.md`. Esto de aquí es solo para correrlo en local.

## Requisitos

- Node ≥ 22
- pnpm ≥ 9 — **este proyecto usa pnpm, no npm.** Nunca corras `npm install`
  aquí (deja un `package-lock.json` que no sirve para nada y puede confundir
  la resolución de dependencias del workspace).
- PostgreSQL corriendo en `localhost:5432` (Docker, instalación nativa, lo
  que uses normalmente).
- Opcional, solo si vas a probar pagos con tarjeta: [Stripe CLI](https://stripe.com/docs/stripe-cli).

## Setup inicial

```bash
pnpm install
```

Copia las variables de entorno de ejemplo y llena los valores reales:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Aplica las migraciones y carga el catálogo inicial (planes, cuentas
bancarias, admins):

```bash
pnpm db:migrate
pnpm db:seed
```

## Levantar el proyecto

Asegúrate de que Postgres esté corriendo primero, luego:

```bash
pnpm dev
```

Levanta `api` (puerto 3001) y `web` (puerto 5173) en paralelo. Si prefieres
verlos por separado (logs más claros), en dos terminales:

```bash
pnpm --filter api dev
pnpm --filter web dev
```

### Probar pagos con tarjeta (Stripe) en local

Stripe no puede mandar el webhook directo a tu `localhost`, así que en una
terminal aparte:

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

El comando imprime un `whsec_...` — confirma que coincide con
`STRIPE_WEBHOOK_SECRET` en `apps/api/.env` (normalmente es estable entre
corridas del CLI, pero si cambia hay que actualizarlo). Sin esto corriendo,
el checkout se crea pero el pago nunca se confirma (la solicitud se queda en
`RECIBIDA`).

Tarjeta de prueba: `4242 4242 4242 4242`, cualquier fecha futura, cualquier
CVC.

## Otros comandos útiles (desde la raíz)

```bash
pnpm db:studio      # explorador visual de la BD — http://localhost:5555
pnpm build          # build de producción de ambos apps
pnpm --filter api test   # suite de pruebas del backend (webhook de Stripe)
```

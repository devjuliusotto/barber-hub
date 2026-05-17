# Barber Hub

The definitive SaaS ecosystem for barbershops in Germany — combining a public marketplace, full ERP dashboard, client CRM, and appointment management in one platform.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/barber-hub run dev` — run the frontend (port 21576)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite, TailwindCSS, Wouter, TanStack Query, Recharts, Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle ORM schema (barbershops, barbers, services, clients, appointments, reviews)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/barber-hub/src/` — React frontend (pages, components)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not hand-edit)
- `lib/api-zod/src/generated/` — Generated Zod validation schemas (do not hand-edit)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed hooks + Zod validators
- Dashboard uses `barbershopId=1` as the demo shop for all ERP views
- Appointments enrich data at query time (joining barber/client/service names in the route handler)
- Reviews update barbershop rating automatically on POST /reviews
- Revenue chart computed server-side from last 30 days of completed appointments

## Product

**Public Marketplace (`/`, `/marketplace`, `/barbershops/:id`):**
- Discover barbershops across Germany with nationality flags (🇧🇷🇹🇷🇩🇪🇪🇸🇮🇹🇳🇬)
- Filter by city, rating, specialty, language, nationality
- View barbershop profiles with services, barbers, and reviews

**ERP Dashboard (`/dashboard/*` — owner view):**
- Revenue KPIs, revenue chart (last 30 days), today's schedule
- Appointment management: list, filter by status, confirm/complete/cancel
- Client CRM: searchable list, loyalty points, spend history, preferences
- Team management: barber profiles and availability
- Service catalog: add/edit/delete with price and duration
- Settings: edit barbershop profile

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen`
- Do not hand-edit files in `lib/api-client-react/src/generated/` or `lib/api-zod/src/generated/`
- Body schema names in OpenAPI must be entity-shaped (e.g. `BarbershopInput`) not operation-shaped (e.g. `CreateBarbershopBody`) to avoid TS2308 collisions

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

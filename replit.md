# Barber Hub

SaaS marketplace and ERP for barbershops in Germany, now running as a React/Vite frontend backed directly by Supabase.

## Run

- `pnpm run dev` — run the Vite app on port 21576
- `pnpm --filter @workspace/barber-hub run typecheck` — typecheck the app
- `pnpm --filter @workspace/barber-hub run build` — production build
- `pnpm run typecheck` — workspace typecheck
- `pnpm run build` — workspace typecheck + build

Required env for local/Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `PORT=21576`
- `BASE_PATH=/`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React + Vite
- TailwindCSS
- Wouter
- TanStack Query
- Recharts
- Supabase client

## Main App

- `artifacts/barber-hub/src/` — React app
- `artifacts/barber-hub/src/utils/supabase.ts` — Supabase client
- `artifacts/barber-hub/src/lib/supabase/` — data access layer

## Supabase Tables

Barber Hub uses `bh_`-prefixed tables:

- `bh_barbershops`
- `bh_barbers`
- `bh_services`
- `bh_reviews`
- `bh_clients`
- `bh_appointments`
- `bh_expenses`

## Product Surface

Public marketplace:

- `/`
- `/marketplace`
- `/barbershops/:id`

ERP dashboard:

- `/dashboard`
- `/dashboard/appointments`
- `/dashboard/clients`
- `/dashboard/clients/:id`
- `/dashboard/barbers`
- `/dashboard/services`
- `/dashboard/financial`
- `/dashboard/settings`

## Notes

- The old Express/OpenAPI/Drizzle backend was removed after the migration to Supabase.
- MVP dashboard policies are permissive and must be replaced with authenticated RLS before production launch.

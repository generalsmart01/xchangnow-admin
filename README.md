# XchangNow — Admin Console

Management dashboard for XchangNow staff (SUPER_ADMIN, ADMIN, OPS,
CUSTOMER_SERVICE): review transactions, process payouts, manage KYC, rates,
wallets and staff.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **TanStack Query** (data) and **TanStack Table** (grids)
- **react-hook-form** + **zod** (forms/validation)
- **shadcn/ui** + **Tailwind CSS v4** (UI), **sonner** (toasts)
- **Recharts** (rate history), **date-fns**, **decimal.js**, **lucide-react**
- **next-themes** (light/dark)

### Brand palette

Defined as CSS variables in [`src/app/globals.css`](src/app/globals.css):

- **Primary** — teal/emerald (growth, crypto, money) → buttons & primary actions
- **Secondary** — deep indigo (fintech trust) → dark branded sidebar chrome
- **Accent** — amber/gold → complementary highlights
- Plus semantic `success` / `warning` / `info` / `destructive` tokens for status badges

Swap the brand mark in [`admin-sidebar.tsx`](src/components/layout/admin-sidebar.tsx)
and the login panel when the logo is ready (currently an "X" placeholder).

## Getting started

```bash
cp .env.example .env.local   # then set BACKEND_URL
npm install
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

## Architecture

```
Browser ──▶ /api/auth/*      (Route Handlers: set httpOnly cookies)
Browser ──▶ /api/proxy/[...] (Route Handler: attaches access cookie, forwards to backend)
                                   │
                                   ▼
                            BACKEND_URL + /api
```

- Tokens live in **httpOnly cookies** (`access_token` 15m / `refresh_token` 7d) —
  never in JS. The browser only ever calls this app's `/api/*`.
- [`middleware.ts`](src/middleware.ts) gates `/admin/*` by decoding the access
  cookie (FE affordance — the backend re-checks every request).
- [`src/lib/api/client.ts`](src/lib/api/client.ts) unwraps the response
  envelope, throws `ApiError` (with `requestId`), and silently refreshes once on
  a recoverable 401.
- Role-based UI: [`src/lib/auth/rbac.ts`](src/lib/auth/rbac.ts) mirrors the
  backend permission matrix; [`<RoleGate>`](src/components/layout/role-gate.tsx)
  and the sidebar use it for visibility/disabled states.

## Environment

| Var | Default | Purpose |
|---|---|---|
| `BACKEND_LOCAL_URL` | `http://localhost:3450` | Backend API origin used in **development** |
| `BACKEND_SERVER_URL` | — | Backend API origin used in **production** |
| `BACKEND_API_PREFIX` | `/api` | Backend mount prefix |

The proxy uses `BACKEND_LOCAL_URL` in dev and `BACKEND_SERVER_URL` in prod
(falling back to whichever is set). All backend calls happen server-side — the
browser only ever talks to this app's `/api/*`.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint

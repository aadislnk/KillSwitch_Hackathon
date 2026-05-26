# KillSwitch Frontend

React + TypeScript dashboard shell for KillSwitch.

## Stack

- React + Vite
- TailwindCSS
- shadcn/ui-style primitives (local `components/ui/*`)
- React Router
- Zustand
- Axios
- Recharts

## Local setup

1. Copy `./.env.example` → `./.env`
2. Install and run:

```bash
npm install
npm run dev
```

The app defaults to a **dark-mode SaaS dashboard shell** with placeholder pages:

- Dashboard
- Integrations
- Findings
- Rules
- Actions Log

## Frontend architecture

```
src/
  components/   # reusable UI + feature components
  hooks/        # cross-cutting hooks (theme, etc.)
  layouts/      # app shells (DashboardLayout)
  pages/        # route-level pages
  routes/       # route objects + paths
  services/     # http client + API wrappers
  store/        # Zustand stores
  lib/          # shared utilities (cn, etc.)
  types/        # shared types / DTOs
```

## Backend connectivity (later)

- Configure `VITE_API_BASE_URL` in `.env`.
- The Axios instance is defined in `src/services/http.ts`.
- Add typed API calls in `src/services/api.ts` and consume them from pages/hooks/stores.


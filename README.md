# KillSwitch

**KillSwitch** is an AI-powered SaaS Cost Autopilot platform. This repository is a **production-grade monorepo foundation**: clean structure, modular boundaries, and ready-to-extend scaffolding—**no business logic, auth, or real APIs implemented yet**.

## Monorepo layout

```
KillSwitch/
  frontend/   # React (Vite + TS) dashboard shell + client architecture
  backend/    # FastAPI service skeleton (APScheduler + Supabase-ready)
  docs/       # Architecture notes, ADRs, diagrams (add as you build)
  prompts/    # Prompt templates / evaluation prompts for AI services
  scripts/    # Convenience scripts (Windows)
  README.md
  .env.example
```

## Quickstart (local)

### Frontend

- Copy `frontend/.env.example` → `frontend/.env`
- Run:

```bash
cd frontend
npm install
npm run dev
```

### Backend

- Copy `backend/.env.example` → `backend/.env`
- Run (Windows PowerShell):

```powershell
.\backend\scripts\run_dev.ps1
```

Or (bash):

```bash
./backend/scripts/run_dev.sh
```

## Frontend dashboard architecture

- **Base URL**: the frontend reads `VITE_API_BASE_URL` and configures a centralized Axios client in `frontend/src/services/http.ts`. If unset, it defaults to `/api/v1`.
- **API layering**:
  - put typed request/response DTOs in `frontend/src/types/`
  - put thin API wrappers in `frontend/src/services/api.ts`
  - keep domain orchestration and caching in Zustand stores rather than inside components
- **State flow**: `frontend/src/store/appStore.ts` fetches findings, rules, actions, approvals, and integrations, then derives dashboard stats from shared state.
- **Fallback behavior**: `frontend/src/services/mockData.ts` provides resilient dashboard data when the API is unavailable or empty.
- **Pages**: Dashboard, Integrations, Findings, Rules, Actions Log, and Approvals are mounted through the existing React Router layout.

## Hackathon demo flow

- Start at `/landing` to introduce KillSwitch, the FinOps problem, connected systems, and the live savings story.
- Open `/` for the operator dashboard. Use **Generate scenario** to add a new AI finding and approval request.
- Use **Simulate action** to show savings updating live and a completed action landing in the audit trail.
- Visit `/findings` to show rich AI explanations such as abandoned Loom, unused GitHub seats, idle staging EC2, duplicate analytics tools, and Datadog cost spike.
- Visit `/actions-log` and `/approvals` to show enterprise-grade auditability and human-in-the-loop controls.

## Next development steps

- **Supabase**: add migrations/SQL and a small data access layer in `backend/app/db/`.
- **Auth**: implement auth separately (frontend route guards + backend dependencies), without leaking auth concerns into services.
- **Integrations**: build provider adapters in `backend/app/integrations/` and normalize incoming cost data.
- **AI services**: add provider clients and prompt chains in `backend/app/ai/` + `prompts/`, with evaluations under `docs/`.
- **Rules & execution**: define rule schemas (`backend/app/schemas/`), evaluation (`backend/app/rules/`), and safe executors (`backend/app/executors/`), scheduled via `backend/app/scheduler/`.

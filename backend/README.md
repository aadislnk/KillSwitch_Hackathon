# KillSwitch Backend

FastAPI service skeleton for KillSwitch.

## Stack

- FastAPI + Uvicorn
- Pydantic (settings + schemas)
- APScheduler (job orchestration)
- Supabase (database foundation)

## Local setup

1. Copy `./.env.example` to `./.env`
2. Run:

### Windows PowerShell

```powershell
.\scripts\run_dev.ps1
```

### macOS/Linux

```bash
./scripts/run_dev.sh
```

Then open:

- `GET /api/v1/health` -> `{ "status": "ok" }`
- `GET /api/v1/health/db` -> Supabase configuration and connection status

## Supabase database setup

1. Create a Supabase project.
2. Copy `../docs/supabase_schema.sql` into the Supabase SQL editor and run it.
3. Add these values to `./.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Start the backend and call `GET /api/v1/health/db`.

The backend prefers `SUPABASE_SERVICE_ROLE_KEY` for server-side database access.
Do not expose that key to the frontend.

## Backend architecture

```text
app/
  main.py           # FastAPI app + lifespan wiring
  api/              # routing composition (versioned)
  core/             # settings + logging
  scheduler/        # APScheduler wiring (placeholders only)
  integrations/     # external systems (Supabase, clouds, SaaS)
  services/         # domain services and data access orchestration
  ai/               # provider clients + prompt chains (later)
  rules/            # rule evaluation layer (later)
  executors/        # safe action executors (later)
  db/               # Supabase client and reusable CRUD helpers
  models/           # typed database/domain models
  schemas/          # Pydantic create/update/read DTOs
  utils/            # shared helpers
```

## Module 2 generated files

- `app/core/config.py` loads typed environment configuration and exposes `get_settings()`.
- `app/db/supabase.py` creates the reusable Supabase client and connection test helper.
- `app/db/crud.py` provides generic create, read, list, update, and delete helpers.
- `app/models/` contains typed Pydantic models and enum values for database records.
- `app/schemas/` contains Pydantic create/update/read schemas for every Module 2 table.
- `app/services/database.py` wraps reusable CRUD helpers with database service methods.
- `app/services/examples.py` shows example insert and query functions without business logic.
- `app/api/v1/routes/health.py` includes `/health` and `/health/db`.
- `../docs/supabase_schema.sql` documents and creates the Supabase tables, keys, indexes, and comments.

## Module 3 integration endpoints

- `POST /api/v1/integrations/github/connect` stores a GitHub integration record for a user.
- `GET /api/v1/integrations/github/sync` fetches GitHub organization seat activity, normalizes it, and stores spend records.
- `POST /api/v1/integrations/slack/connect` validates a Slack webhook and can send a test alert.
- `GET /api/v1/integrations/aws/mock-data` returns realistic AWS EC2 mock spend data, with optional Supabase storage.

Module 3 files:

- `app/integrations/github_connector.py` contains the GitHub REST connector and sample member activity response.
- `app/integrations/slack_connector.py` contains Slack webhook alert/action notification helpers.
- `app/integrations/aws_mock_connector.py` generates deterministic EC2-style mock spend records.
- `app/integrations/normalizer.py` converts provider payloads into the shared spend/usage schema.
- `app/services/sync_service.py` coordinates fetch, normalize, and store operations.
- `app/api/v1/routes/integrations.py` exposes the integration API routes through the existing v1 router.

## Module 4 findings endpoints

- `GET /api/v1/findings` lists persisted findings and returns sample findings when the database is unavailable.
- `POST /api/v1/findings/run-analysis` runs heuristics, optionally enriches findings with an LLM, and stores new findings.
- `GET /api/v1/findings/{id}` fetches one persisted finding.

Module 4 files:

- `app/ai/heuristics.py` contains deterministic detectors for zombie subscriptions, unused seats, idle resources, duplicate tools, and cost spikes.
- `app/ai/detector.py` is the hybrid detector entry point. It runs heuristics first; LLM enrichment happens later.
- `app/ai/llm_service.py` enriches detected findings with OpenAI or Claude when API keys are configured, and falls back to deterministic text otherwise.
- `app/ai/prompts.py` stores compact structured prompts for each supported finding type.
- `app/services/findings_service.py` loads spend records, prevents duplicate open findings, enriches findings, and persists them.
- `app/api/v1/routes/findings.py` exposes the findings API through the existing v1 router.

## Module 5 automation endpoints

- `POST /api/v1/rules` creates a rule.
- `GET /api/v1/rules` lists rules.
- `POST /api/v1/actions/run` evaluates rules for a finding and either queues approval, sends an alert, or runs a sandbox-safe executor.
- `GET /api/v1/actions/logs` lists auditable action logs.
- `GET /api/v1/approvals` lists pending approvals.
- `POST /api/v1/approvals/{id}/approve` approves a pending action request.
- `POST /api/v1/approvals/{id}/reject` rejects a pending action request.

Module 5 files:

- `app/rules/conditions.py` evaluates reusable condition types such as finding type, severity, savings, inactivity days, provider, and confidence.
- `app/rules/evaluator.py` converts matching rules into execution decisions: `alert_only`, `approval_required`, or `auto_execute`.
- `app/rules/engine.py` evaluates findings against enabled rules.
- `app/executors/` contains isolated executors for Slack, GitHub seat removal simulation, mock cloud actions, and mock email.
- `app/services/automation_service.py` coordinates rule decisions, approval queueing, executor calls, and action logs.
- `app/services/approval_service.py` manages pending approval decisions.
- `app/api/v1/routes/rules.py`, `actions.py`, and `approvals.py` expose the automation API through the existing v1 router.

Automation flow:

1. Findings are created by Module 4.
2. Rules evaluate finding attributes and choose an execution mode.
3. `approval_required` creates an approval request plus a pending action log.
4. `alert_only` sends or simulates a notification and records the action.
5. `auto_execute` only runs sandbox-safe executors; real destructive cloud mutations are not implemented.

## Notes

- This repo intentionally avoids implementing auth and business logic until the foundations are in place.
- The scheduler currently registers only a placeholder heartbeat job to prove lifecycle wiring.

-- KillSwitch Module 2 Supabase schema
-- Apply this file in the Supabase SQL editor or via `supabase db push`.
-- Business logic, AI execution, and integrations are intentionally excluded.

create extension if not exists "pgcrypto";

create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    company_name text not null,
    role text not null default 'admin',
    created_at timestamptz not null default now()
);

create table if not exists public.integrations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    provider text not null,
    status text not null default 'pending',
    last_sync timestamptz,
    metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.spend_records (
    id uuid primary key default gen_random_uuid(),
    integration_id uuid not null references public.integrations(id) on delete cascade,
    tool_name text not null,
    monthly_cost numeric(12, 2) not null check (monthly_cost >= 0),
    usage_score integer not null check (usage_score between 0 and 100),
    last_used timestamptz,
    resource_type text not null,
    snapshot_date date not null
);

create table if not exists public.ai_findings (
    id uuid primary key default gen_random_uuid(),
    resource_id uuid not null references public.spend_records(id) on delete cascade,
    finding_type text not null,
    severity text not null,
    confidence numeric(4, 3) not null check (confidence >= 0 and confidence <= 1),
    estimated_savings numeric(12, 2) not null check (estimated_savings >= 0),
    recommended_action text not null,
    reason text,
    explanation text,
    risk_summary text,
    optimization_recommendation text,
    status text not null default 'open',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.rules (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    condition_type text not null,
    threshold text not null,
    action text not null,
    approval_required boolean not null default true,
    enabled boolean not null default true
);

create table if not exists public.actions (
    id uuid primary key default gen_random_uuid(),
    finding_id uuid not null references public.ai_findings(id) on delete cascade,
    action_type text not null,
    status text not null default 'pending',
    executed_at timestamptz,
    savings numeric(12, 2) check (savings is null or savings >= 0),
    execution_log text,
    execution_result text,
    execution_mode text,
    rollback_status text
);

create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    channel text not null,
    message text not null,
    status text not null default 'pending',
    created_at timestamptz not null default now()
);

create table if not exists public.approvals (
    id uuid primary key default gen_random_uuid(),
    finding_id uuid not null references public.ai_findings(id) on delete cascade,
    action_id uuid references public.actions(id) on delete set null,
    status text not null default 'pending',
    approved_by uuid references public.users(id) on delete set null,
    approved_at timestamptz
);

create index if not exists idx_integrations_user_id on public.integrations(user_id);
create index if not exists idx_spend_records_integration_id on public.spend_records(integration_id);
create index if not exists idx_spend_records_snapshot_date on public.spend_records(snapshot_date);
create index if not exists idx_ai_findings_resource_id on public.ai_findings(resource_id);
create index if not exists idx_ai_findings_status on public.ai_findings(status);
create unique index if not exists idx_ai_findings_open_unique
    on public.ai_findings(resource_id, finding_type)
    where status = 'open';
create index if not exists idx_rules_user_id on public.rules(user_id);
create index if not exists idx_actions_finding_id on public.actions(finding_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_approvals_finding_id on public.approvals(finding_id);
create index if not exists idx_approvals_action_id on public.approvals(action_id);

comment on table public.users is 'KillSwitch SaaS customer accounts and company ownership.';
comment on table public.integrations is 'Connected SaaS or cloud providers. Provider-specific metadata stays in jsonb.';
comment on table public.spend_records is 'Point-in-time SaaS spend and usage snapshots.';
comment on table public.ai_findings is 'AI-generated optimization findings, populated by a future AI module.';
comment on table public.rules is 'User-defined automation policy configuration.';
comment on table public.actions is 'Execution records for approved or automated savings actions.';
comment on table public.notifications is 'Outbound user notifications.';
comment on table public.approvals is 'Human approval records for findings that require review.';

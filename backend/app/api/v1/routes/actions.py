from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from app.db.supabase import DatabaseConfigError, DatabaseQueryError
from app.services.automation_service import automation_service

router = APIRouter()
logger = logging.getLogger(__name__)


class RunActionRequest(BaseModel):
    finding_id: UUID
    action_type: str | None = None
    execution_mode: str = "dry_run"
    slack_webhook_url: str | None = None
    recipient_email: str | None = None


@router.post("/run")
async def run_action(payload: RunActionRequest):
    """Evaluate rules and run or queue a sandbox-safe action."""

    try:
        return await automation_service.run_action(
            finding_id=str(payload.finding_id),
            action_type=payload.action_type,
            execution_mode=payload.execution_mode,
            slack_webhook_url=payload.slack_webhook_url,
            recipient_email=payload.recipient_email,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except (DatabaseConfigError, DatabaseQueryError) as exc:
        logger.exception("run_action_failed finding_id=%s", payload.finding_id)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@router.get("/logs")
def list_action_logs(limit: int = Query(default=100, ge=1, le=500)):
    """List auditable action logs."""

    return automation_service.list_action_logs(limit=limit)

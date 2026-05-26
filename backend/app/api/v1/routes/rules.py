from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query, status

from app.db.supabase import DatabaseConfigError, DatabaseQueryError
from app.schemas.rules import RuleCreate
from app.services.automation_service import automation_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("")
def create_rule(payload: RuleCreate):
    """Create an automation rule."""

    try:
        return automation_service.create_rule(payload)
    except (DatabaseConfigError, DatabaseQueryError) as exc:
        logger.exception("create_rule_failed=true")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@router.get("")
def list_rules(limit: int = Query(default=100, ge=1, le=500)):
    """List automation rules."""

    return automation_service.list_rules(limit=limit)

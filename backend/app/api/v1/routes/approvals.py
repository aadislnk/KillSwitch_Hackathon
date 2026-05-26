from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from app.db.supabase import DatabaseConfigError, DatabaseQueryError
from app.services.approval_service import approval_service

router = APIRouter()
logger = logging.getLogger(__name__)


class ApprovalDecisionRequest(BaseModel):
    approved_by: UUID | None = None


@router.get("")
def list_approvals(limit: int = Query(default=100, ge=1, le=500)):
    """List pending approval requests."""

    try:
        return approval_service.list_pending(limit=limit)
    except (DatabaseConfigError, DatabaseQueryError) as exc:
        logger.exception("list_approvals_failed=true")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@router.post("/{approval_id}/approve")
def approve(approval_id: UUID, payload: ApprovalDecisionRequest):
    """Approve a pending action request."""

    try:
        return approval_service.approve(
            str(approval_id),
            approved_by=str(payload.approved_by) if payload.approved_by else None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except (DatabaseConfigError, DatabaseQueryError) as exc:
        logger.exception("approve_failed id=%s", approval_id)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@router.post("/{approval_id}/reject")
def reject(approval_id: UUID, payload: ApprovalDecisionRequest):
    """Reject a pending action request."""

    try:
        return approval_service.reject(
            str(approval_id),
            approved_by=str(payload.approved_by) if payload.approved_by else None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except (DatabaseConfigError, DatabaseQueryError) as exc:
        logger.exception("reject_failed id=%s", approval_id)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from app.db.supabase import DatabaseConfigError, DatabaseQueryError
from app.services.findings_service import findings_service

router = APIRouter()
logger = logging.getLogger(__name__)


class RunAnalysisRequest(BaseModel):
    integration_id: UUID | None = None
    limit: int = 500
    enrich: bool = True


@router.get("")
def list_findings(limit: int = Query(default=100, ge=1, le=500)):
    """List persisted AI findings with sample fallback data."""

    return findings_service.list_findings(limit=limit)


@router.post("/run-analysis")
async def run_analysis(payload: RunAnalysisRequest):
    """Run heuristic detection, optional LLM enrichment, and persistence."""

    return await findings_service.run_analysis(
        integration_id=str(payload.integration_id) if payload.integration_id else None,
        limit=max(1, min(payload.limit, 1000)),
        enrich=payload.enrich,
    )


@router.get("/{finding_id}")
def get_finding(finding_id: UUID):
    """Fetch one persisted finding by id."""

    try:
        finding = findings_service.get_finding(str(finding_id))
    except (DatabaseConfigError, DatabaseQueryError) as exc:
        logger.exception("get_finding_failed id=%s", finding_id)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    if not finding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")
    return finding

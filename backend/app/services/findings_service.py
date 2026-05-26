from __future__ import annotations

import logging
from typing import Any

from pydantic import ValidationError

from app.ai.detector import findings_detector
from app.ai.heuristics import SAMPLE_FINDINGS, HeuristicFinding
from app.ai.llm_service import LLMServiceError, llm_service
from app.db.supabase import DatabaseConfigError, DatabaseQueryError
from app.schemas.ai_findings import AIFindingCreate
from app.services.database import database_service

logger = logging.getLogger(__name__)


class FindingsService:
    """Runs detection, enriches findings, and persists results."""

    def list_findings(self, limit: int = 100) -> dict[str, Any]:
        try:
            return {"findings": database_service.list_findings(limit=limit), "sample_findings": SAMPLE_FINDINGS}
        except (DatabaseConfigError, DatabaseQueryError) as exc:
            logger.info("list_findings_fallback reason=%s", exc)
            return {"findings": [], "sample_findings": SAMPLE_FINDINGS, "errors": [str(exc)]}

    def get_finding(self, finding_id: str) -> dict[str, Any] | None:
        return database_service.get_ai_finding(finding_id)

    async def run_analysis(
        self,
        *,
        integration_id: str | None = None,
        limit: int = 500,
        enrich: bool = True,
    ) -> dict[str, Any]:
        try:
            spend_records = (
                database_service.list_integration_spend(integration_id)
                if integration_id
                else database_service.list_spend_records(limit=limit)
            )
        except (DatabaseConfigError, DatabaseQueryError) as exc:
            logger.exception("findings_spend_load_failed integration_id=%s", integration_id)
            return {
                "detected_count": 0,
                "stored_count": 0,
                "findings": [],
                "sample_findings": SAMPLE_FINDINGS,
                "errors": [str(exc)],
            }

        detected = findings_detector.detect(spend_records)
        stored: list[dict[str, Any]] = []
        skipped_duplicates = 0
        errors: list[str] = []

        for finding in detected:
            try:
                if self._is_duplicate(finding):
                    skipped_duplicates += 1
                    continue
                enriched = await self._enrich(finding) if enrich else {}
                stored.append(self._persist_finding(finding, enriched))
            except (DatabaseConfigError, DatabaseQueryError, ValidationError, LLMServiceError) as exc:
                logger.warning(
                    "finding_store_or_enrich_failed type=%s resource_id=%s",
                    finding.finding_type,
                    finding.resource_id,
                )
                errors.append(f"{finding.finding_type}:{finding.resource_id}: {exc}")

        return {
            "detected_count": len(detected),
            "stored_count": len(stored),
            "skipped_duplicates": skipped_duplicates,
            "findings": stored,
            "errors": errors,
        }

    @staticmethod
    def _is_duplicate(finding: HeuristicFinding) -> bool:
        existing = database_service.find_existing_finding(finding.resource_id, finding.finding_type)
        return existing is not None

    async def _enrich(self, finding: HeuristicFinding) -> dict[str, str]:
        payload = finding.model_dump(mode="json")
        try:
            return await llm_service.enrich_finding(payload)
        except LLMServiceError:
            raise
        except Exception as exc:
            raise LLMServiceError("Unexpected LLM enrichment failure") from exc

    @staticmethod
    def _persist_finding(finding: HeuristicFinding, enrichment: dict[str, str]) -> dict[str, Any]:
        payload = AIFindingCreate(
            resource_id=finding.resource_id,
            finding_type=finding.finding_type,
            severity=finding.severity,
            confidence=finding.confidence,
            estimated_savings=finding.estimated_savings,
            recommended_action=finding.recommended_action,
            reason=finding.reason,
            explanation=enrichment.get("explanation"),
            risk_summary=enrichment.get("risk_summary"),
            optimization_recommendation=enrichment.get("optimization_recommendation"),
        )
        return database_service.create_ai_finding(payload)


findings_service = FindingsService()

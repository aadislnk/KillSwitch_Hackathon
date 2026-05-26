from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import UTC, date, datetime
from typing import Any

from pydantic import ValidationError

from app.db.supabase import DatabaseConfigError, DatabaseQueryError
from app.integrations.aws_mock_connector import AWSMockConnector
from app.integrations.github_connector import GitHubConnector, GitHubIntegrationError
from app.integrations.normalizer import NormalizedUsageRecord, normalize_records
from app.schemas.integrations import IntegrationUpdate
from app.schemas.spend_records import SpendRecordCreate
from app.services.database import database_service

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class SyncResult:
    provider: str
    normalized_records: list[dict[str, Any]]
    stored_records: list[dict[str, Any]]
    errors: list[str]

    @property
    def stored_count(self) -> int:
        return len(self.stored_records)

    def to_dict(self) -> dict[str, Any]:
        return {
            "provider": self.provider,
            "normalized_count": len(self.normalized_records),
            "stored_count": self.stored_count,
            "normalized_records": self.normalized_records,
            "stored_records": self.stored_records,
            "errors": self.errors,
        }


class SyncService:
    """Fetch, normalize, and persist external usage data."""

    async def sync_github(
        self,
        *,
        integration_id: str,
        org: str,
        token: str,
    ) -> SyncResult:
        try:
            connector = GitHubConnector(token=token, org=org)
            source = await connector.fetch_normalized_source_data()
            normalized = normalize_records("github", source["members"])
        except (GitHubIntegrationError, ValueError, ValidationError) as exc:
            logger.exception("github_sync_fetch_failed integration_id=%s", integration_id)
            return SyncResult("github", [], [], [str(exc)])

        return self._store_normalized_records(
            provider="github",
            integration_id=integration_id,
            records=normalized,
        )

    def sync_aws_mock(self, *, integration_id: str, count: int = 6) -> SyncResult:
        try:
            source_records = AWSMockConnector().fetch_usage_data(count=count)
            normalized = normalize_records("aws", source_records)
        except (ValueError, ValidationError) as exc:
            logger.exception("aws_mock_sync_failed integration_id=%s", integration_id)
            return SyncResult("aws", [], [], [str(exc)])

        return self._store_normalized_records(
            provider="aws",
            integration_id=integration_id,
            records=normalized,
        )

    def _store_normalized_records(
        self,
        *,
        provider: str,
        integration_id: str,
        records: list[NormalizedUsageRecord],
    ) -> SyncResult:
        stored_records: list[dict[str, Any]] = []
        errors: list[str] = []

        for record in records:
            payload = SpendRecordCreate(
                integration_id=integration_id,
                tool_name=record.tool_name,
                monthly_cost=record.monthly_cost,
                usage_score=record.usage_score,
                last_used=record.last_used,
                resource_type=record.resource_type,
                snapshot_date=date.today(),
            )
            try:
                stored_records.append(database_service.create_spend_record(payload))
            except (DatabaseConfigError, DatabaseQueryError, ValidationError) as exc:
                logger.warning(
                    "spend_record_store_failed provider=%s integration_id=%s tool_name=%s",
                    provider,
                    integration_id,
                    record.tool_name,
                )
                errors.append(f"{record.tool_name}: {exc}")

        self._mark_sync_complete(integration_id, provider, errors)

        return SyncResult(
            provider=provider,
            normalized_records=[record.model_dump(mode="json") for record in records],
            stored_records=stored_records,
            errors=errors,
        )

    def _mark_sync_complete(self, integration_id: str, provider: str, errors: list[str]) -> None:
        try:
            database_service.update_integration(
                integration_id,
                IntegrationUpdate(
                    status="error" if errors else "connected",
                    last_sync=datetime.now(UTC),
                    metadata={"provider": provider, "last_sync_errors": errors},
                ),
            )
        except (DatabaseConfigError, DatabaseQueryError, ValidationError) as exc:
            logger.info("integration_sync_status_update_skipped id=%s reason=%s", integration_id, exc)


sync_service = SyncService()

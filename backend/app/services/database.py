from __future__ import annotations

from typing import Any

from app.db.crud import create_record, get_record_by_id, list_records, update_record
from app.schemas.ai_findings import AIFindingCreate
from app.schemas.actions import ActionCreate, ActionUpdate
from app.schemas.approvals import ApprovalCreate, ApprovalUpdate
from app.schemas.integrations import IntegrationCreate, IntegrationUpdate
from app.schemas.rules import RuleCreate
from app.schemas.spend_records import SpendRecordCreate
from app.schemas.users import UserCreate


class DatabaseService:
    """Thin service layer over reusable CRUD helpers."""

    def create_user(self, payload: UserCreate) -> dict[str, Any]:
        return create_record("users", payload)

    def get_user(self, user_id: str) -> dict[str, Any] | None:
        return get_record_by_id("users", user_id)

    def create_integration(self, payload: IntegrationCreate) -> dict[str, Any]:
        return create_record("integrations", payload)

    def get_integration(self, integration_id: str) -> dict[str, Any] | None:
        return get_record_by_id("integrations", integration_id)

    def update_integration(self, integration_id: str, payload: IntegrationUpdate) -> dict[str, Any] | None:
        return update_record("integrations", integration_id, payload)

    def list_user_integrations(self, user_id: str) -> list[dict[str, Any]]:
        return list_records("integrations", filters={"user_id": user_id}, order_by="last_sync")

    def create_spend_record(self, payload: SpendRecordCreate) -> dict[str, Any]:
        return create_record("spend_records", payload)

    def list_integration_spend(self, integration_id: str) -> list[dict[str, Any]]:
        return list_records(
            "spend_records",
            filters={"integration_id": integration_id},
            order_by="snapshot_date",
        )

    def list_spend_records(self, limit: int = 500) -> list[dict[str, Any]]:
        return list_records("spend_records", limit=limit, order_by="snapshot_date")

    def create_ai_finding(self, payload: AIFindingCreate) -> dict[str, Any]:
        return create_record("ai_findings", payload)

    def get_ai_finding(self, finding_id: str) -> dict[str, Any] | None:
        return get_record_by_id("ai_findings", finding_id)

    def list_open_findings(self) -> list[dict[str, Any]]:
        return list_records("ai_findings", filters={"status": "open"}, order_by="estimated_savings")

    def list_findings(self, limit: int = 100) -> list[dict[str, Any]]:
        return list_records("ai_findings", limit=limit, order_by="estimated_savings")

    def find_existing_finding(self, resource_id: str, finding_type: str) -> dict[str, Any] | None:
        rows = list_records(
            "ai_findings",
            filters={"resource_id": resource_id, "finding_type": finding_type, "status": "open"},
            limit=1,
        )
        return rows[0] if rows else None

    def create_rule(self, payload: RuleCreate) -> dict[str, Any]:
        return create_record("rules", payload)

    def list_rules(self, limit: int = 100) -> list[dict[str, Any]]:
        return list_records("rules", limit=limit)

    def create_action(self, payload: ActionCreate) -> dict[str, Any]:
        return create_record("actions", payload)

    def update_action(self, action_id: str, payload: ActionUpdate) -> dict[str, Any] | None:
        return update_record("actions", action_id, payload)

    def list_actions(self, limit: int = 100) -> list[dict[str, Any]]:
        return list_records("actions", limit=limit, order_by="executed_at")

    def create_approval(self, payload: ApprovalCreate) -> dict[str, Any]:
        return create_record("approvals", payload)

    def update_approval(self, approval_id: str, payload: ApprovalUpdate) -> dict[str, Any] | None:
        return update_record("approvals", approval_id, payload)

    def get_approval(self, approval_id: str) -> dict[str, Any] | None:
        return get_record_by_id("approvals", approval_id)

    def list_pending_approvals(self, limit: int = 100) -> list[dict[str, Any]]:
        return list_records("approvals", filters={"status": "pending"}, limit=limit)


database_service = DatabaseService()

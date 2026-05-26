from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from app.schemas.approvals import ApprovalUpdate
from app.schemas.actions import ActionUpdate
from app.services.database import database_service


class ApprovalService:
    """Approval queue service for human-in-the-loop actions."""

    def list_pending(self, limit: int = 100) -> dict[str, Any]:
        return {"approvals": database_service.list_pending_approvals(limit=limit)}

    def approve(self, approval_id: str, approved_by: str | None = None) -> dict[str, Any]:
        return self._set_status(approval_id, "approved", approved_by)

    def reject(self, approval_id: str, approved_by: str | None = None) -> dict[str, Any]:
        return self._set_status(approval_id, "rejected", approved_by)

    @staticmethod
    def _set_status(approval_id: str, status: str, approved_by: str | None) -> dict[str, Any]:
        existing = database_service.get_approval(approval_id)
        if not existing:
            raise ValueError("Approval request not found")

        updated = database_service.update_approval(
            approval_id,
            ApprovalUpdate(
                status=status,
                approved_by=approved_by,
                approved_at=datetime.now(UTC),
            ),
        )
        action_id = existing.get("action_id")
        if action_id:
            database_service.update_action(
                action_id,
                ActionUpdate(
                    status="skipped" if status == "rejected" else "pending",
                    execution_log=(
                        "Approval rejected; action will not execute."
                        if status == "rejected"
                        else "Approval granted; action is ready for safe execution."
                    ),
                ),
            )
        return updated or existing


approval_service = ApprovalService()

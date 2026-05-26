from __future__ import annotations

import json
import logging
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

from app.db.supabase import DatabaseConfigError, DatabaseQueryError
from app.executors.email_executor import EmailExecutor
from app.executors.github_executor import GitHubExecutor
from app.executors.mock_cloud_executor import MockCloudExecutor
from app.executors.slack_executor import SlackExecutor
from app.models.enums import ActionStatus
from app.rules.engine import SAMPLE_RULE, rule_engine
from app.schemas.actions import ActionCreate
from app.schemas.approvals import ApprovalCreate
from app.services.database import database_service

logger = logging.getLogger(__name__)


SAFE_MODES = {"simulation", "dry_run", "safe_execute"}


class AutomationService:
    """Coordinates rule decisions, approvals, executors, and action logs."""

    def create_rule(self, payload) -> dict[str, Any]:
        return database_service.create_rule(payload)

    def list_rules(self, limit: int = 100) -> dict[str, Any]:
        try:
            return {"rules": database_service.list_rules(limit=limit), "sample_rule": SAMPLE_RULE}
        except (DatabaseConfigError, DatabaseQueryError) as exc:
            return {"rules": [], "sample_rule": SAMPLE_RULE, "errors": [str(exc)]}

    async def run_action(
        self,
        *,
        finding_id: str,
        action_type: str | None = None,
        execution_mode: str = "dry_run",
        slack_webhook_url: str | None = None,
        recipient_email: str | None = None,
    ) -> dict[str, Any]:
        if execution_mode not in SAFE_MODES:
            raise ValueError(f"Unsupported execution mode: {execution_mode}")

        finding = database_service.get_ai_finding(finding_id)
        if not finding:
            raise ValueError("Finding not found")

        rules = database_service.list_rules()
        decisions = rule_engine.evaluate_findings([finding], rules)
        selected = decisions[0] if decisions else {
            "execution_mode": "approval_required",
            "action_type": action_type or "manual_review",
            "rule": None,
        }

        resolved_action_type = action_type or selected["action_type"]
        resolved_mode = selected["execution_mode"]

        if resolved_mode == "approval_required":
            action = self._log_action(
                finding=finding,
                action_type=resolved_action_type,
                status=ActionStatus.PENDING,
                execution_mode="approval_required",
                result={"message": "Approval required before execution."},
            )
            approval = database_service.create_approval(
                ApprovalCreate(finding_id=finding_id, action_id=action["id"], status="pending")
            )
            return {"mode": "approval_required", "approval": approval, "action": action, "decision": selected}

        if resolved_mode == "alert_only":
            result = await self._execute(
                action_type="slack_alert" if resolved_action_type == "manual_review" else resolved_action_type,
                finding=finding,
                execution_mode="dry_run" if execution_mode == "simulation" else execution_mode,
                slack_webhook_url=slack_webhook_url,
                recipient_email=recipient_email,
            )
            action = self._log_action(
                finding=finding,
                action_type=resolved_action_type,
                status=ActionStatus.COMPLETED,
                execution_mode="alert_only",
                result=result,
            )
            return {"mode": "alert_only", "action": action, "execution": result, "decision": selected}

        result = await self._execute(
            action_type=resolved_action_type,
            finding=finding,
            execution_mode=execution_mode,
            slack_webhook_url=slack_webhook_url,
            recipient_email=recipient_email,
        )
        action = self._log_action(
            finding=finding,
            action_type=resolved_action_type,
            status=ActionStatus.COMPLETED,
            execution_mode=execution_mode,
            result=result,
        )
        return {"mode": "auto_execute", "action": action, "execution": result, "decision": selected}

    def list_action_logs(self, limit: int = 100) -> dict[str, Any]:
        try:
            return {"actions": database_service.list_actions(limit=limit)}
        except (DatabaseConfigError, DatabaseQueryError) as exc:
            return {"actions": [], "errors": [str(exc)]}

    async def _execute(
        self,
        *,
        action_type: str,
        finding: dict[str, Any],
        execution_mode: str,
        slack_webhook_url: str | None,
        recipient_email: str | None,
    ) -> dict[str, Any]:
        if action_type in {"slack_alert", "alert"}:
            return await SlackExecutor().execute(
                finding=finding,
                webhook_url=slack_webhook_url,
                mode=execution_mode,
            )
        if action_type in {"github_remove_seat", "remove_github_seat"}:
            return GitHubExecutor().execute(finding=finding, mode=execution_mode)
        if action_type in {"cloud_shutdown", "cloud_resize", "mock_cloud_action"}:
            return MockCloudExecutor().execute(finding=finding, mode=execution_mode)
        if action_type in {"email", "email_owner"}:
            return EmailExecutor().execute(
                finding=finding,
                recipient=recipient_email,
                mode=execution_mode,
            )
        return EmailExecutor().execute(finding=finding, recipient=recipient_email, mode="simulation")

    @staticmethod
    def _log_action(
        *,
        finding: dict[str, Any],
        action_type: str,
        status: ActionStatus,
        execution_mode: str,
        result: dict[str, Any],
    ) -> dict[str, Any]:
        return database_service.create_action(
            ActionCreate(
                finding_id=finding["id"],
                action_type=action_type,
                status=status,
                executed_at=datetime.now(UTC),
                savings=Decimal(str(finding.get("estimated_savings") or "0")),
                execution_log=result.get("execution_log") or result.get("message") or json.dumps(result),
                execution_result=json.dumps(result),
                execution_mode=execution_mode,
                rollback_status="not_required",
            )
        )


automation_service = AutomationService()

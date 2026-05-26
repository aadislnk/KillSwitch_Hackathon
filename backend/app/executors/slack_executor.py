from __future__ import annotations

from decimal import Decimal
from typing import Any

from app.integrations.slack_connector import SlackConnector


MOCK_SLACK_EXECUTION: dict[str, Any] = {
    "executor": "slack",
    "status": "simulated",
    "message": "Slack alert would be sent with finding and action summary.",
}


class SlackExecutor:
    """Sends or simulates Slack action alerts."""

    async def execute(
        self,
        *,
        finding: dict[str, Any],
        webhook_url: str | None = None,
        mode: str = "dry_run",
    ) -> dict[str, Any]:
        summary = self._summary(finding)
        if mode in {"simulation", "dry_run"} or not webhook_url:
            return {**MOCK_SLACK_EXECUTION, "mode": mode, "summary": summary}

        delivery = await SlackConnector(webhook_url).send_action_notification(summary)
        return {"executor": "slack", "status": "completed", "mode": mode, "summary": summary, "delivery": delivery}

    @staticmethod
    def _summary(finding: dict[str, Any]) -> str:
        savings = Decimal(str(finding.get("estimated_savings") or "0"))
        return (
            f"{finding.get('finding_type', 'optimization')} "
            f"({finding.get('severity', 'unknown')}): "
            f"estimated monthly savings {savings}. "
            f"Recommended action: {finding.get('recommended_action', 'Review manually.')}"
        )

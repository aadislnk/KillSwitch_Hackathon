from __future__ import annotations

from datetime import UTC, datetime
from typing import Any


MOCK_EMAIL_EXECUTION: dict[str, Any] = {
    "executor": "email",
    "status": "simulated",
    "message": "Optimization email is mocked; no SMTP provider is contacted.",
}


class EmailExecutor:
    """Mock email sender for optimization notifications."""

    def execute(self, *, finding: dict[str, Any], recipient: str | None = None, mode: str = "simulation") -> dict[str, Any]:
        subject = f"KillSwitch optimization: {finding.get('finding_type', 'finding')}"
        return {
            **MOCK_EMAIL_EXECUTION,
            "mode": mode,
            "recipient": recipient or "owner@example.com",
            "subject": subject,
            "timestamp": datetime.now(UTC).isoformat(),
            "execution_log": f"Mock email prepared with subject '{subject}'.",
        }

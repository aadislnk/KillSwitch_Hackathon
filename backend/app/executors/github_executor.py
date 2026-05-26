from __future__ import annotations

from datetime import UTC, datetime
from typing import Any


MOCK_GITHUB_EXECUTION: dict[str, Any] = {
    "executor": "github",
    "status": "simulated",
    "message": "Inactive seat removal is simulated; no GitHub account is modified.",
}


class GitHubExecutor:
    """Sandbox-safe GitHub executor that simulates inactive seat removal."""

    def execute(self, *, finding: dict[str, Any], mode: str = "simulation") -> dict[str, Any]:
        resource = finding.get("resource") or {}
        user = resource.get("tool_name") or resource.get("login") or "unknown-user"
        return {
            **MOCK_GITHUB_EXECUTION,
            "mode": mode,
            "target_user": user,
            "timestamp": datetime.now(UTC).isoformat(),
            "execution_log": f"Simulated removal of inactive GitHub seat for {user}.",
        }

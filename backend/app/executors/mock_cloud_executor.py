from __future__ import annotations

from datetime import UTC, datetime
from typing import Any


MOCK_CLOUD_EXECUTION: dict[str, Any] = {
    "executor": "mock_cloud",
    "status": "simulated",
    "message": "Cloud action is simulated; no real infrastructure is changed.",
}


class MockCloudExecutor:
    """Simulates EC2 resize/shutdown actions without touching cloud APIs."""

    def execute(self, *, finding: dict[str, Any], mode: str = "simulation") -> dict[str, Any]:
        resource = finding.get("resource") or {}
        resource_name = resource.get("tool_name") or resource.get("instance_name") or "unknown-resource"
        planned_action = "shutdown" if finding.get("finding_type") == "idle_resource" else "resize"
        return {
            **MOCK_CLOUD_EXECUTION,
            "mode": mode,
            "resource": resource_name,
            "planned_action": planned_action,
            "resource_status": f"simulated_{planned_action}_recommended",
            "timestamp": datetime.now(UTC).isoformat(),
            "execution_log": f"Simulated EC2 {planned_action} for {resource_name}.",
        }

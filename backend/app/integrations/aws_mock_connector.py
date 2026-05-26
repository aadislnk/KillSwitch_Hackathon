from __future__ import annotations

from datetime import UTC, datetime, timedelta
from random import Random
from typing import Any

SAMPLE_AWS_MOCK_RESPONSE: list[dict[str, Any]] = [
    {
        "instance_name": "prod-api-i-0821",
        "cpu_usage": 74,
        "monthly_cost": 186.25,
        "last_active": "2026-05-26T09:00:00Z",
        "resource_type": "ec2_instance",
    },
    {
        "instance_name": "staging-worker-i-4412",
        "cpu_usage": 6,
        "monthly_cost": 92.40,
        "last_active": "2026-04-08T14:15:00Z",
        "resource_type": "ec2_instance",
    },
]


class AWSMockConnector:
    """Deterministic mock connector for cloud spend sync development."""

    def __init__(self, seed: int = 42) -> None:
        self.random = Random(seed)

    def generate_mock_spend_data(self, count: int = 6) -> list[dict[str, Any]]:
        count = max(1, min(count, 50))
        now = datetime.now(UTC)
        resources = []

        for index in range(count):
            cpu_usage = self.random.choice([3, 8, 17, 31, 56, 73, 89])
            monthly_cost = round(self.random.uniform(28.0, 420.0), 2)
            last_active = now - timedelta(days=self.random.choice([0, 1, 4, 12, 31, 64]))
            environment = self.random.choice(["prod", "staging", "dev", "analytics"])

            resources.append(
                {
                    "instance_name": f"{environment}-ec2-{1000 + index}",
                    "cpu_usage": cpu_usage,
                    "monthly_cost": monthly_cost,
                    "last_active": last_active.isoformat(),
                    "resource_type": "ec2_instance",
                }
            )

        return resources

    def fetch_usage_data(self, count: int = 6) -> list[dict[str, Any]]:
        return self.generate_mock_spend_data(count=count)

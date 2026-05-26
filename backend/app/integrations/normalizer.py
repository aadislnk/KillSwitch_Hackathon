from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field


class NormalizedUsageRecord(BaseModel):
    """Unified spend/usage shape consumed by the sync service."""

    tool_name: str
    resource_type: str
    monthly_cost: Decimal = Field(ge=0)
    usage_score: int = Field(ge=0, le=100)
    last_used: datetime | None = None
    provider: str


def parse_datetime(value: Any) -> datetime | None:
    """Parse external timestamp strings without making providers agree first."""

    if not value:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    return None


def normalize_github_user(raw_user: dict[str, Any]) -> NormalizedUsageRecord:
    last_used = parse_datetime(raw_user.get("last_activity_at") or raw_user.get("updated_at"))
    usage_score = int(raw_user.get("usage_score", 0))

    return NormalizedUsageRecord(
        tool_name=raw_user.get("login", "unknown-github-user"),
        resource_type="github_user_seat",
        monthly_cost=Decimal(str(raw_user.get("monthly_cost", "0"))),
        usage_score=max(0, min(100, usage_score)),
        last_used=last_used,
        provider="github",
    )


def normalize_aws_resource(raw_resource: dict[str, Any]) -> NormalizedUsageRecord:
    return NormalizedUsageRecord(
        tool_name=raw_resource.get("instance_name", "unknown-aws-resource"),
        resource_type=raw_resource.get("resource_type", "ec2_instance"),
        monthly_cost=Decimal(str(raw_resource.get("monthly_cost", "0"))),
        usage_score=max(0, min(100, int(raw_resource.get("cpu_usage", 0)))),
        last_used=parse_datetime(raw_resource.get("last_active")),
        provider="aws",
    )


def normalize_records(provider: str, records: list[dict[str, Any]]) -> list[NormalizedUsageRecord]:
    """Dispatch provider-specific payloads into the unified schema."""

    if provider == "github":
        return [normalize_github_user(record) for record in records]
    if provider == "aws":
        return [normalize_aws_resource(record) for record in records]
    raise ValueError(f"Unsupported provider for normalization: {provider}")


def utc_now() -> datetime:
    return datetime.now(UTC)

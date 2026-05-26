from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from typing import Any


def as_decimal(value: Any) -> Decimal:
    try:
        return Decimal(str(value or "0"))
    except Exception:
        return Decimal("0")


def inactivity_days(finding: dict[str, Any]) -> int:
    resource = finding.get("resource") or {}
    last_used = resource.get("last_used")
    if not last_used:
        return 0
    try:
        parsed = datetime.fromisoformat(str(last_used).replace("Z", "+00:00"))
    except ValueError:
        return 0
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)
    return max(0, (datetime.now(UTC) - parsed).days)


def get_condition_value(finding: dict[str, Any], condition_type: str) -> Any:
    resource = finding.get("resource") or {}
    match condition_type:
        case "finding_type":
            return finding.get("finding_type")
        case "severity":
            return finding.get("severity")
        case "estimated_savings":
            return as_decimal(finding.get("estimated_savings"))
        case "confidence":
            return as_decimal(finding.get("confidence"))
        case "inactivity_days":
            return inactivity_days(finding)
        case "provider":
            return resource.get("provider") or finding.get("provider")
        case _:
            return finding.get(condition_type) or resource.get(condition_type)


def condition_matches(finding: dict[str, Any], rule: dict[str, Any]) -> bool:
    condition_type = str(rule.get("condition_type") or "")
    threshold = rule.get("threshold")
    value = get_condition_value(finding, condition_type)

    if condition_type in {"finding_type", "severity", "provider"}:
        return str(value).lower() == str(threshold).lower()

    if condition_type in {"estimated_savings", "confidence"}:
        return as_decimal(value) > as_decimal(threshold)

    if condition_type == "inactivity_days":
        return int(value or 0) > int(as_decimal(threshold))

    return str(value).lower() == str(threshold).lower()

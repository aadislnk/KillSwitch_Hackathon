from __future__ import annotations

from typing import Any


SYSTEM_PROMPT = (
    "You are KillSwitch, a SaaS cost optimization analyst. "
    "Enrich only the finding provided. Do not invent extra resources, actions, or policy decisions."
)


PROMPT_TEMPLATES: dict[str, str] = {
    "zombie_subscription": (
        "Explain why this subscription appears inactive and costly. "
        "Include a practical cancellation or owner-review recommendation."
    ),
    "unused_seats": (
        "Explain why these seats look unused. "
        "Recommend a low-risk review or deprovisioning workflow."
    ),
    "idle_resource": (
        "Explain why this cloud resource appears idle. "
        "Summarize cost impact and a safe rightsizing or shutdown review."
    ),
    "duplicate_tool": (
        "Explain why this tool may overlap with another provider or category. "
        "Recommend a consolidation review without assuming it can be removed automatically."
    ),
    "cost_spike": (
        "Explain the likely impact of this spend increase. "
        "Recommend investigation steps and owner review."
    ),
    "optimization_summary": (
        "Summarize the cost optimization opportunity in clear business language."
    ),
}


def build_enrichment_prompt(finding: dict[str, Any]) -> str:
    """Build a compact prompt using only the already-detected finding."""

    finding_type = str(finding.get("finding_type", "optimization_summary"))
    instruction = PROMPT_TEMPLATES.get(finding_type, PROMPT_TEMPLATES["optimization_summary"])
    compact_finding = {
        "finding_type": finding.get("finding_type"),
        "severity": finding.get("severity"),
        "confidence": finding.get("confidence"),
        "estimated_savings": finding.get("estimated_savings"),
        "recommended_action": finding.get("recommended_action"),
        "reason": finding.get("reason"),
        "resource": finding.get("resource", {}),
    }

    return (
        f"{instruction}\n\n"
        "Return JSON with exactly these keys: explanation, risk_summary, optimization_recommendation.\n"
        f"Finding:\n{compact_finding}"
    )

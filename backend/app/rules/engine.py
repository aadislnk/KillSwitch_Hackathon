from __future__ import annotations

from typing import Any

from app.rules.evaluator import rule_evaluator


SAMPLE_RULE: dict[str, Any] = {
    "condition_type": "estimated_savings",
    "threshold": 100,
    "action": "slack_alert",
    "approval_required": False,
    "enabled": True,
}


class RuleEngine:
    """Thin orchestration wrapper around modular rule evaluation."""

    def evaluate_findings(self, findings: list[dict[str, Any]], rules: list[dict[str, Any]]) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []
        for finding in findings:
            for decision in rule_evaluator.evaluate(finding, rules):
                results.append({"finding": finding, **decision})
        return results


rule_engine = RuleEngine()

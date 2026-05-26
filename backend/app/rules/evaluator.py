from __future__ import annotations

from typing import Any

from app.rules.conditions import condition_matches


SUPPORTED_EXECUTION_MODES = {"alert_only", "approval_required", "auto_execute"}


def execution_mode_for_rule(rule: dict[str, Any]) -> str:
    raw_action = str(rule.get("action") or "")
    if raw_action in SUPPORTED_EXECUTION_MODES:
        return raw_action
    if bool(rule.get("approval_required", True)):
        return "approval_required"
    if raw_action.startswith("alert"):
        return "alert_only"
    return "auto_execute"


def action_type_for_rule(rule: dict[str, Any]) -> str:
    action = str(rule.get("action") or "slack_alert")
    if action in SUPPORTED_EXECUTION_MODES:
        return "slack_alert" if action == "alert_only" else "manual_review"
    return action


class RuleEvaluator:
    """Evaluates enabled rules against a finding."""

    def evaluate(self, finding: dict[str, Any], rules: list[dict[str, Any]]) -> list[dict[str, Any]]:
        decisions: list[dict[str, Any]] = []
        for rule in rules:
            if not rule.get("enabled", True):
                continue
            if not condition_matches(finding, rule):
                continue
            decisions.append(
                {
                    "rule": rule,
                    "matched": True,
                    "execution_mode": execution_mode_for_rule(rule),
                    "action_type": action_type_for_rule(rule),
                }
            )
        return decisions


rule_evaluator = RuleEvaluator()

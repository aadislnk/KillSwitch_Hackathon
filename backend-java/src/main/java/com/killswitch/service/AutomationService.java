package com.killswitch.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.killswitch.executor.GitHubExecutor;
import com.killswitch.executor.SlackExecutor;
import com.killswitch.executor.StripeExecutor;
import com.killswitch.rules.RuleEngine;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AutomationService {
    private final DatabaseService database;
    private final RuleEngine ruleEngine;
    private final SlackExecutor slackExecutor;
    private final GitHubExecutor gitHubExecutor;
    private final StripeExecutor stripeExecutor;
    private final ObjectMapper objectMapper;

    public Map<String, Object> createRule(Map<String, Object> payload) {
        return database.createRule(payload);
    }

    public Map<String, Object> listRules(int limit) {
        try {
            return Map.of("rules", database.listRules(limit), "sample_rule", sampleRule());
        } catch (Exception e) {
            return Map.of("rules", List.of(), "sample_rule", sampleRule(), "errors", List.of(e.getMessage()));
        }
    }

    public Map<String, Object> updateRule(String id, Map<String, Object> payload) {
        return database.updateRule(id, payload);
    }

    public void deleteRule(String id) {
        database.deleteRule(id);
    }

    public Map<String, Object> runAction(String findingId, String actionType, String executionMode,
        String slackWebhookUrl, String recipientEmail) {
        if (!List.of("simulation", "dry_run", "safe_execute").contains(executionMode)) {
            throw new IllegalArgumentException("Unsupported execution mode: " + executionMode);
        }
        Map<String, Object> finding = database.getFinding(findingId);
        if (finding == null) {
            throw new IllegalArgumentException("Finding not found");
        }

        List<RuleEngine.Decision> decisions = ruleEngine.evaluate(List.of(finding), database.listRules(100));
        RuleEngine.Decision decision = decisions.isEmpty()
            ? new RuleEngine.Decision(finding, null, actionType == null ? "manual_review" : actionType, "approval_required")
            : decisions.get(0);

        String resolvedAction = actionType == null || actionType.isBlank() ? decision.actionType() : actionType;
        String resolvedMode = decision.executionMode();
        if ("approval_required".equals(resolvedMode)) {
            Map<String, Object> action = logAction(finding, resolvedAction, "pending", "approval_required",
                Map.of("message", "Approval required before execution."));
            Map<String, Object> approval = database.createApproval(Map.of(
                "finding_id", findingId,
                "action_id", action.get("id"),
                "status", "pending"
            ));
            return Map.of("mode", "approval_required", "approval", approval, "action", action, "decision", decision.toMap());
        }

        Map<String, Object> result = execute(resolvedAction, finding, executionMode, slackWebhookUrl);
        Map<String, Object> action = logAction(finding, resolvedAction, "completed", executionMode, result);
        return Map.of("mode", "auto_execute", "action", action, "execution", result, "decision", decision.toMap());
    }

    public Map<String, Object> listActionLogs(int limit) {
        try {
            return Map.of("actions", database.listActions(limit));
        } catch (Exception e) {
            return Map.of("actions", List.of(), "errors", List.of(e.getMessage()));
        }
    }

    public Map<String, Object> getAction(String id) {
        return database.getAction(id);
    }

    public Map<String, Object> approve(String approvalId, String approvedBy) {
        return setApprovalStatus(approvalId, "approved", approvedBy);
    }

    public Map<String, Object> reject(String approvalId, String approvedBy) {
        return setApprovalStatus(approvalId, "rejected", approvedBy);
    }

    public Map<String, Object> listPendingApprovals(int limit) {
        try {
            return Map.of("approvals", database.listPendingApprovals(limit));
        } catch (Exception e) {
            return Map.of("approvals", List.of(), "errors", List.of(e.getMessage()));
        }
    }

    private Map<String, Object> setApprovalStatus(String approvalId, String status, String approvedBy) {
        Map<String, Object> existing = database.getApproval(approvalId);
        if (existing == null) {
            throw new IllegalArgumentException("Approval request not found");
        }
        Map<String, Object> update = new LinkedHashMap<>();
        update.put("status", status);
        update.put("approved_by", approvedBy);
        update.put("approved_at", OffsetDateTime.now());
        Map<String, Object> updated = database.updateApproval(approvalId, update);
        Object actionId = existing.get("action_id");
        if (actionId != null) {
            database.updateAction(String.valueOf(actionId), Map.of(
                "status", "rejected".equals(status) ? "skipped" : "pending",
                "execution_log", "rejected".equals(status)
                    ? "Approval rejected; action will not execute."
                    : "Approval granted; action is ready for safe execution."
            ));
        }
        return updated == null ? existing : updated;
    }

    private Map<String, Object> execute(String actionType, Map<String, Object> finding, String mode, String slackWebhookUrl) {
        if (List.of("slack_alert", "alert", "manual_review").contains(actionType)) {
            return slackExecutor.execute(finding, slackWebhookUrl, mode);
        }
        if (List.of("github_remove_seat", "remove_github_seat", "remove_seat").contains(actionType)) {
            return gitHubExecutor.execute(finding, mode);
        }
        if (List.of("stripe_cancel_subscription", "cancel").contains(actionType)) {
            return stripeExecutor.execute(finding, mode);
        }
        return Map.of("executed", false, "mode", "simulation", "execution_log", "No executor exists for " + actionType);
    }

    private Map<String, Object> logAction(Map<String, Object> finding, String actionType, String status,
        String executionMode, Map<String, Object> result) {
        try {
            return database.createAction(Map.of(
                "finding_id", finding.get("id"),
                "action_type", actionType,
                "status", status,
                "executed_at", OffsetDateTime.now(),
                "savings", new BigDecimal(String.valueOf(finding.getOrDefault("estimated_savings", "0"))),
                "execution_mode", executionMode,
                "execution_log", String.valueOf(result.getOrDefault("execution_log", result.getOrDefault("message", ""))),
                "execution_result", objectMapper.writeValueAsString(result),
                "rollback_status", "not_required"
            ));
        } catch (Exception e) {
            throw new RuntimeException("Unable to log action: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> sampleRule() {
        return Map.of(
            "condition_type", "estimated_savings",
            "threshold", "100",
            "action", "manual_review",
            "approval_required", true,
            "enabled", true
        );
    }
}

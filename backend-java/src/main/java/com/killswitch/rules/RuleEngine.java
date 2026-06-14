package com.killswitch.rules;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class RuleEngine {
    public record Decision(Map<String, Object> finding, Map<String, Object> rule, String actionType, String executionMode) {
        public Map<String, Object> toMap() {
            return Map.of(
                "finding", finding,
                "rule", rule == null ? Map.of() : rule,
                "action_type", actionType,
                "execution_mode", executionMode
            );
        }
    }

    public List<Decision> evaluate(List<Map<String, Object>> findings, List<Map<String, Object>> rules) {
        List<Decision> decisions = new ArrayList<>();
        for (Map<String, Object> finding : findings) {
            for (Map<String, Object> rule : rules) {
                if (!asBoolean(rule.getOrDefault("enabled", true))) {
                    continue;
                }
                if (matches(finding, rule)) {
                    String mode = asBoolean(rule.getOrDefault("approval_required", true))
                        ? "approval_required" : "safe_execute";
                    decisions.add(new Decision(finding, rule, String.valueOf(rule.get("action")), mode));
                    break;
                }
            }
        }
        return decisions;
    }

    private boolean matches(Map<String, Object> finding, Map<String, Object> rule) {
        try {
            String condition = String.valueOf(rule.get("condition_type"));
            String threshold = String.valueOf(rule.get("threshold"));
            return switch (condition) {
                case "estimated_savings" -> decimal(finding.get("estimated_savings")).compareTo(new BigDecimal(threshold)) > 0;
                case "finding_type" -> threshold.equals(String.valueOf(finding.get("finding_type")));
                case "provider" -> threshold.equals(String.valueOf(finding.get("provider")));
                case "confidence" -> Double.parseDouble(String.valueOf(finding.get("confidence"))) > Double.parseDouble(threshold);
                case "severity" -> threshold.equals(String.valueOf(finding.get("severity")));
                default -> false;
            };
        } catch (Exception ignored) {
            return false;
        }
    }

    private BigDecimal decimal(Object value) {
        return value == null ? BigDecimal.ZERO : new BigDecimal(String.valueOf(value));
    }

    private boolean asBoolean(Object value) {
        return value instanceof Boolean bool ? bool : Boolean.parseBoolean(String.valueOf(value));
    }
}

package com.killswitch.ai;

import java.util.Map;

public final class PromptBuilder {
    private PromptBuilder() {
    }

    public static final String SYSTEM_PROMPT = """
        You are KillSwitch, an AI financial operations analyst specializing in SaaS and cloud cost optimization.
        Produce:
        1. A clear explanation of why this resource is wasteful.
        2. A short risk summary.
        3. A concrete optimization recommendation.
        Respond only with JSON keys: explanation, risk_summary, optimization_recommendation.
        """;

    public static String buildEnrichmentPrompt(Map<String, Object> finding) {
        return SYSTEM_PROMPT + "\nAnalyze this waste finding:\n"
            + "Finding type: " + finding.getOrDefault("finding_type", "unknown") + "\n"
            + "Severity: " + finding.getOrDefault("severity", "unknown") + "\n"
            + "Monthly savings: $" + finding.getOrDefault("estimated_savings", 0) + "\n"
            + "Confidence: " + finding.getOrDefault("confidence", 0) + "\n"
            + "Reason: " + finding.getOrDefault("reason", "") + "\n"
            + "Recommended action: " + finding.getOrDefault("recommended_action", "");
    }
}

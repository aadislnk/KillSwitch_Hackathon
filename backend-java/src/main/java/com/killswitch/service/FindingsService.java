package com.killswitch.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.killswitch.ai.GeminiService;
import com.killswitch.ai.HeuristicsEngine;
import com.killswitch.model.Finding;
import com.killswitch.model.SpendRecord;
import com.killswitch.rules.RuleEngine;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FindingsService {
    private final DatabaseService database;
    private final HeuristicsEngine heuristicsEngine;
    private final GeminiService geminiService;
    private final RuleEngine ruleEngine;
    private final ObjectMapper objectMapper;

    public Map<String, Object> listFindingsEnvelope(int limit, String status, String severity) {
        try {
            Map<String, Object> filters = new LinkedHashMap<>();
            if (status != null && !status.isBlank()) {
                filters.put("status", status);
            }
            if (severity != null && !severity.isBlank()) {
                filters.put("severity", severity);
            }
            return Map.of("findings", database.listFindings(limit, filters), "sample_findings", sampleFindings());
        } catch (Exception e) {
            return Map.of("findings", List.of(), "sample_findings", sampleFindings(), "errors", List.of(e.getMessage()));
        }
    }

    public List<Map<String, Object>> getFindings(int limit, String status, String severity) {
        return castList(listFindingsEnvelope(limit, status, severity).get("findings"));
    }

    public Map<String, Object> getFindingById(String id) {
        return database.getFinding(id);
    }

    public Map<String, Object> runAnalysis(String integrationId, int limit, boolean enrich) {
        List<Map<String, Object>> spendRows;
        try {
            spendRows = integrationId == null || integrationId.isBlank()
                ? database.listSpendRecords(limit)
                : database.listIntegrationSpend(integrationId);
        } catch (Exception e) {
            return Map.of(
                "detected_count", 0,
                "stored_count", 0,
                "findings", List.of(),
                "sample_findings", sampleFindings(),
                "errors", List.of(e.getMessage())
            );
        }

        List<SpendRecord> spendRecords = spendRows.stream()
            .map(row -> objectMapper.convertValue(row, SpendRecord.class))
            .toList();
        List<Finding> detected = heuristicsEngine.analyze(spendRecords);
        List<Map<String, Object>> stored = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int skipped = 0;

        for (Finding finding : detected) {
            Map<String, Object> payload = findingPayload(finding);
            try {
                if (database.findExistingFinding(String.valueOf(payload.get("resource_id")), String.valueOf(payload.get("finding_type"))) != null) {
                    skipped++;
                    continue;
                }
                if (enrich) {
                    payload.putAll(geminiService.enrichFinding(payload));
                }
                Map<String, Object> created = database.createFinding(payload);
                if (created != null) {
                    stored.add(created);
                }
            } catch (Exception e) {
                errors.add(payload.get("finding_type") + ":" + payload.get("resource_id") + ": " + e.getMessage());
            }
        }

        return Map.of(
            "detected_count", detected.size(),
            "stored_count", stored.size(),
            "skipped_duplicates", skipped,
            "findings", stored,
            "errors", errors
        );
    }

    public Map<String, Object> runAnalysis(boolean enrich) {
        return runAnalysis(null, 500, enrich);
    }

    public Map<String, Object> updateStatus(String id, String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("status is required");
        }
        return database.updateFinding(id, Map.of("status", status));
    }

    public void deleteFinding(String id) {
        database.deleteFinding(id);
    }

    public Map<String, Object> applyRules() {
        List<Map<String, Object>> findings = database.listFindings(500, Map.of("status", "open"));
        List<Map<String, Object>> rules = database.listRules(500);
        List<RuleEngine.Decision> decisions = ruleEngine.evaluate(findings, rules);
        List<Map<String, Object>> actions = new ArrayList<>();
        for (RuleEngine.Decision decision : decisions) {
            actions.add(database.createAction(Map.of(
                "finding_id", decision.finding().get("id"),
                "action_type", decision.actionType(),
                "status", "pending",
                "execution_mode", decision.executionMode(),
                "savings", decision.finding().getOrDefault("estimated_savings", BigDecimal.ZERO),
                "execution_log", "Rule matched; action queued.",
                "rollback_status", "not_required"
            )));
        }
        return Map.of("decisions", decisions.stream().map(RuleEngine.Decision::toMap).toList(), "actions", actions);
    }

    private Map<String, Object> findingPayload(Finding finding) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("resource_id", finding.getResourceId());
        payload.put("finding_type", finding.getFindingType());
        payload.put("severity", finding.getSeverity());
        payload.put("confidence", finding.getConfidence());
        payload.put("estimated_savings", finding.getEstimatedSavings());
        payload.put("recommended_action", finding.getRecommendedAction());
        payload.put("reason", finding.getReason());
        payload.put("explanation", finding.getExplanation());
        payload.put("risk_summary", finding.getRiskSummary());
        payload.put("optimization_recommendation", finding.getOptimizationRecommendation());
        payload.put("status", finding.getStatus() == null ? "open" : finding.getStatus());
        payload.put("provider", finding.getProvider());
        return payload;
    }

    private List<Map<String, Object>> sampleFindings() {
        return List.of(Map.of(
            "id", "sample-zombie-seat",
            "resource_id", "sample-github-seat",
            "finding_type", "unused_seats",
            "severity", "high",
            "confidence", 0.9,
            "estimated_savings", 21,
            "recommended_action", "remove_seat",
            "reason", "Sample GitHub seat inactive for 60+ days.",
            "status", "open",
            "created_at", OffsetDateTime.now().toString()
        ));
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> castList(Object value) {
        return value instanceof List<?> list ? (List<Map<String, Object>>) list : List.of();
    }
}

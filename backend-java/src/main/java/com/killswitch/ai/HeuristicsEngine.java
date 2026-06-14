package com.killswitch.ai;

import com.killswitch.model.Finding;
import com.killswitch.model.SpendRecord;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class HeuristicsEngine {
    public List<Finding> analyze(List<SpendRecord> records) {
        List<Finding> findings = new ArrayList<>();
        findings.addAll(detectZombieSubscriptions(records));
        findings.addAll(detectUnusedSeats(records));
        findings.addAll(detectIdleResources(records));
        findings.addAll(detectDuplicateTools(records));
        findings.addAll(detectCostSpikes(records));
        return findings;
    }

    private List<Finding> detectZombieSubscriptions(List<SpendRecord> records) {
        List<Finding> found = new ArrayList<>();
        for (SpendRecord r : records) {
            if (r.getUsageScore() != null && r.getUsageScore() < 20
                && positive(r.getMonthlyCost()) && inactiveSince(r.getLastUsed(), 30)) {
                found.add(Finding.builder()
                    .resourceId(resourceId(r))
                    .findingType("zombie_subscription")
                    .severity(r.getMonthlyCost().compareTo(BigDecimal.valueOf(100)) > 0 ? "high" : "medium")
                    .confidence(0.85)
                    .estimatedSavings(r.getMonthlyCost())
                    .recommendedAction("cancel")
                    .reason("Low usage (score: " + r.getUsageScore() + ") for " + r.getToolName()
                        + " costing $" + r.getMonthlyCost() + "/month")
                    .status("open")
                    .provider(r.getResourceType())
                    .build());
            }
        }
        return found;
    }

    private List<Finding> detectUnusedSeats(List<SpendRecord> records) {
        List<Finding> found = new ArrayList<>();
        for (SpendRecord r : records) {
            if (("github_user_seat".equals(r.getResourceType()) || "slack_seat".equals(r.getResourceType()))
                && r.getUsageScore() != null && r.getUsageScore() < 10 && inactiveSince(r.getLastUsed(), 60)) {
                found.add(Finding.builder()
                    .resourceId(resourceId(r))
                    .findingType("unused_seats")
                    .severity("high")
                    .confidence(0.90)
                    .estimatedSavings(defaultZero(r.getMonthlyCost()))
                    .recommendedAction("remove_seat")
                    .reason("Seat inactive for 60+ days: " + r.getToolName())
                    .status("open")
                    .provider(r.getResourceType())
                    .build());
            }
        }
        return found;
    }

    private List<Finding> detectIdleResources(List<SpendRecord> records) {
        List<Finding> found = new ArrayList<>();
        for (SpendRecord r : records) {
            if (("ec2_instance".equals(r.getResourceType()) || "aws_service".equals(r.getResourceType()))
                && r.getUsageScore() != null && r.getUsageScore() < 15) {
                found.add(Finding.builder()
                    .resourceId(resourceId(r))
                    .findingType("idle_resource")
                    .severity("critical")
                    .confidence(0.80)
                    .estimatedSavings(defaultZero(r.getMonthlyCost()))
                    .recommendedAction("downscale_or_terminate")
                    .reason("Cloud resource idle: " + r.getToolName() + " usage at " + r.getUsageScore() + "%")
                    .status("open")
                    .provider("aws")
                    .build());
            }
        }
        return found;
    }

    private List<Finding> detectDuplicateTools(List<SpendRecord> records) {
        Map<String, List<SpendRecord>> byType = new HashMap<>();
        for (SpendRecord r : records) {
            if (r.getResourceType() != null) {
                byType.computeIfAbsent(r.getResourceType(), k -> new ArrayList<>()).add(r);
            }
        }
        List<Finding> found = new ArrayList<>();
        for (Map.Entry<String, List<SpendRecord>> entry : byType.entrySet()) {
            if (entry.getValue().size() > 1) {
                BigDecimal total = entry.getValue().stream()
                    .map(r -> defaultZero(r.getMonthlyCost()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                found.add(Finding.builder()
                    .resourceId(entry.getKey())
                    .findingType("duplicate_tool")
                    .severity("medium")
                    .confidence(0.70)
                    .estimatedSavings(total.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP))
                    .recommendedAction("consolidate")
                    .reason("Multiple tools of type: " + entry.getKey() + " (" + entry.getValue().size() + " tools)")
                    .status("open")
                    .provider("multiple")
                    .build());
            }
        }
        return found;
    }

    private List<Finding> detectCostSpikes(List<SpendRecord> records) {
        List<Finding> found = new ArrayList<>();
        for (SpendRecord r : records) {
            if (r.getMonthlyCost() != null && r.getMonthlyCost().compareTo(BigDecimal.valueOf(500)) > 0
                && r.getUsageScore() != null && r.getUsageScore() < 30) {
                found.add(Finding.builder()
                    .resourceId(resourceId(r))
                    .findingType("cost_spike")
                    .severity("critical")
                    .confidence(0.75)
                    .estimatedSavings(r.getMonthlyCost().multiply(BigDecimal.valueOf(0.4)))
                    .recommendedAction("investigate_and_optimize")
                    .reason("High cost with low usage: " + r.getToolName() + " costs $" + r.getMonthlyCost() + "/month")
                    .status("open")
                    .provider(r.getResourceType())
                    .build());
            }
        }
        return found;
    }

    private boolean inactiveSince(OffsetDateTime lastUsed, int days) {
        return lastUsed == null || ChronoUnit.DAYS.between(lastUsed, OffsetDateTime.now()) >= days;
    }

    private boolean positive(BigDecimal value) {
        return value != null && value.compareTo(BigDecimal.ZERO) > 0;
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String resourceId(SpendRecord record) {
        return record.getId() != null ? record.getId().toString() : record.getToolName();
    }
}

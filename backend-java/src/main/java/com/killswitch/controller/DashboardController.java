package com.killswitch.controller;

import com.killswitch.service.DatabaseService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DatabaseService databaseService;

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        try {
            List<Map<String, Object>> findings = databaseService.listFindings(500, Map.of());
            List<Map<String, Object>> rules = databaseService.listRules(500);
            List<Map<String, Object>> actions = databaseService.listActions(500);
            BigDecimal totalSavings = findings.stream()
                .map(row -> new BigDecimal(String.valueOf(row.getOrDefault("estimated_savings", "0"))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            long activeRules = rules.stream().filter(row -> Boolean.parseBoolean(String.valueOf(row.getOrDefault("enabled", true)))).count();
            return Map.of(
                "total_savings", totalSavings,
                "findings_count", findings.size(),
                "active_rules", activeRules,
                "actions_taken", actions.size()
            );
        } catch (Exception e) {
            return Map.of("total_savings", 0, "findings_count", 0, "active_rules", 0, "actions_taken", 0,
                "errors", List.of(e.getMessage()));
        }
    }
}

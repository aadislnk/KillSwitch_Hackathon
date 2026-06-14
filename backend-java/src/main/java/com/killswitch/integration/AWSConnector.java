package com.killswitch.integration;

import com.killswitch.model.SpendRecord;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class AWSConnector {
    public static final Map<String, Object> SAMPLE_AWS_MOCK_RESPONSE = Map.of(
        "source", "aws_mock",
        "description", "Representative AWS usage records for local demos"
    );

    public List<Map<String, Object>> fetchUsageData(int count) {
        List<Map<String, Object>> rows = new ArrayList<>();
        String[] names = {"api-prod-1", "worker-idle-2", "analytics-rds", "staging-cache", "legacy-bucket", "batch-gpu"};
        String[] types = {"ec2_instance", "ec2_instance", "aws_service", "aws_service", "aws_service", "ec2_instance"};
        int[] usage = {82, 7, 24, 12, 3, 28};
        BigDecimal[] costs = {
            BigDecimal.valueOf(124), BigDecimal.valueOf(88), BigDecimal.valueOf(740),
            BigDecimal.valueOf(52), BigDecimal.valueOf(31), BigDecimal.valueOf(930)
        };
        for (int i = 0; i < Math.max(1, count); i++) {
            int idx = i % names.length;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("tool_name", names[idx]);
            row.put("resource_type", types[idx]);
            row.put("monthly_cost", costs[idx]);
            row.put("usage_score", usage[idx]);
            row.put("last_used", OffsetDateTime.now().minusDays(10L + idx * 18L).toString());
            rows.add(row);
        }
        return rows;
    }

    public List<SpendRecord> fetchSpendRecords(int count) {
        return fetchUsageData(count).stream().map(row -> {
            SpendRecord record = new SpendRecord();
            record.setToolName(String.valueOf(row.get("tool_name")));
            record.setResourceType(String.valueOf(row.get("resource_type")));
            record.setMonthlyCost(new BigDecimal(String.valueOf(row.get("monthly_cost"))));
            record.setUsageScore(Integer.parseInt(String.valueOf(row.get("usage_score"))));
            record.setLastUsed(OffsetDateTime.parse(String.valueOf(row.get("last_used"))));
            return record;
        }).toList();
    }
}

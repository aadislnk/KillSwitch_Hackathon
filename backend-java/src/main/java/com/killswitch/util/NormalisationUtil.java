package com.killswitch.util;

import com.killswitch.model.SpendRecord;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public final class NormalisationUtil {
    private NormalisationUtil() {
    }

    public static Map<String, Object> spendRecordPayload(String integrationId, SpendRecord record) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("integration_id", UUID.fromString(integrationId));
        payload.put("tool_name", record.getToolName());
        payload.put("monthly_cost", record.getMonthlyCost());
        payload.put("usage_score", record.getUsageScore());
        payload.put("last_used", record.getLastUsed());
        payload.put("resource_type", record.getResourceType());
        payload.put("snapshot_date", LocalDate.now());
        return payload;
    }
}

package com.killswitch.service;

import com.killswitch.integration.AWSConnector;
import com.killswitch.integration.GitHubConnector;
import com.killswitch.integration.StripeConnector;
import com.killswitch.model.SpendRecord;
import com.killswitch.util.NormalisationUtil;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SyncService {
    private final DatabaseService database;
    private final GitHubConnector gitHubConnector;
    private final StripeConnector stripeConnector;
    private final AWSConnector awsConnector;

    public Map<String, Object> syncGitHub(String integrationId, String org, String token) {
        List<SpendRecord> records = gitHubConnector.fetchOrgMembers(org, token);
        return store("github", integrationId, records);
    }

    public Map<String, Object> syncStripe(String integrationId, String apiKey) {
        List<SpendRecord> records = stripeConnector.fetchSubscriptions(apiKey);
        return store("stripe", integrationId, records);
    }

    public Map<String, Object> syncAwsMock(String integrationId, int count) {
        return store("aws", integrationId, awsConnector.fetchSpendRecords(count));
    }

    public Map<String, Object> syncAll() {
        List<Map<String, Object>> integrations = database.listConnectedIntegrations();
        List<Map<String, Object>> results = new ArrayList<>();
        for (Map<String, Object> integration : integrations) {
            String provider = String.valueOf(integration.get("provider"));
            String id = String.valueOf(integration.get("id"));
            if ("aws".equals(provider)) {
                results.add(syncAwsMock(id, 6));
            }
        }
        return Map.of("synced_integrations", results.size(), "results", results);
    }

    private Map<String, Object> store(String provider, String integrationId, List<SpendRecord> records) {
        List<Map<String, Object>> normalized = records.stream()
            .map(record -> NormalisationUtil.spendRecordPayload(integrationId, record))
            .toList();
        List<Map<String, Object>> stored = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        for (SpendRecord record : records) {
            try {
                Map<String, Object> row = database.createSpendRecord(NormalisationUtil.spendRecordPayload(integrationId, record));
                if (row != null) {
                    stored.add(row);
                }
            } catch (Exception e) {
                errors.add(record.getToolName() + ": " + e.getMessage());
            }
        }
        try {
            database.updateIntegration(integrationId, Map.of(
                "status", errors.isEmpty() ? "connected" : "error",
                "last_sync", OffsetDateTime.now(),
                "metadata", Map.of("provider", provider, "last_sync_errors", errors)
            ));
        } catch (Exception ignored) {
        }
        return Map.of(
            "provider", provider,
            "normalized_count", normalized.size(),
            "stored_count", stored.size(),
            "normalized_records", normalized,
            "stored_records", stored,
            "errors", errors
        );
    }
}

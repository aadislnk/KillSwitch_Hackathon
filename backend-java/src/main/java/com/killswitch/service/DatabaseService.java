package com.killswitch.service;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DatabaseService {
    private final SupabaseService supabase;

    public Map<String, Object> createUser(Map<String, Object> payload) {
        return supabase.create("users", payload);
    }

    public Map<String, Object> createIntegration(Map<String, Object> payload) {
        return supabase.create("integrations", payload);
    }

    public Map<String, Object> getIntegration(String id) {
        return supabase.getById("integrations", id);
    }

    public Map<String, Object> updateIntegration(String id, Map<String, Object> payload) {
        return supabase.update("integrations", id, payload);
    }

    public List<Map<String, Object>> listIntegrations(int limit) {
        return supabase.listRecords("integrations", limit, "last_sync");
    }

    public List<Map<String, Object>> listConnectedIntegrations() {
        return supabase.listRecords("integrations", Map.of("status", "connected"), 500, "last_sync");
    }

    public Map<String, Object> createSpendRecord(Map<String, Object> payload) {
        return supabase.create("spend_records", payload);
    }

    public List<Map<String, Object>> listSpendRecords(int limit) {
        return supabase.listRecords("spend_records", limit, "snapshot_date");
    }

    public List<Map<String, Object>> listIntegrationSpend(String integrationId) {
        return supabase.listRecords("spend_records", Map.of("integration_id", integrationId), 1000, "snapshot_date");
    }

    public Map<String, Object> createFinding(Map<String, Object> payload) {
        return supabase.create("ai_findings", payload);
    }

    public Map<String, Object> getFinding(String id) {
        return supabase.getById("ai_findings", id);
    }

    public List<Map<String, Object>> listFindings(int limit, Map<String, Object> filters) {
        return supabase.listRecords("ai_findings", filters, limit, "estimated_savings");
    }

    public Map<String, Object> findExistingFinding(String resourceId, String findingType) {
        List<Map<String, Object>> rows = supabase.listRecords(
            "ai_findings",
            Map.of("resource_id", resourceId, "finding_type", findingType, "status", "open"),
            1,
            null
        );
        return rows.isEmpty() ? null : rows.get(0);
    }

    public Map<String, Object> updateFinding(String id, Map<String, Object> payload) {
        return supabase.update("ai_findings", id, payload);
    }

    public void deleteFinding(String id) {
        supabase.delete("ai_findings", id);
    }

    public Map<String, Object> createRule(Map<String, Object> payload) {
        return supabase.create("rules", payload);
    }

    public List<Map<String, Object>> listRules(int limit) {
        return supabase.listRecords("rules", limit, null);
    }

    public Map<String, Object> updateRule(String id, Map<String, Object> payload) {
        return supabase.update("rules", id, payload);
    }

    public void deleteRule(String id) {
        supabase.delete("rules", id);
    }

    public Map<String, Object> createAction(Map<String, Object> payload) {
        return supabase.create("actions", payload);
    }

    public Map<String, Object> getAction(String id) {
        return supabase.getById("actions", id);
    }

    public Map<String, Object> updateAction(String id, Map<String, Object> payload) {
        return supabase.update("actions", id, payload);
    }

    public List<Map<String, Object>> listActions(int limit) {
        return supabase.listRecords("actions", limit, "executed_at");
    }

    public Map<String, Object> createApproval(Map<String, Object> payload) {
        return supabase.create("approvals", payload);
    }

    public Map<String, Object> getApproval(String id) {
        return supabase.getById("approvals", id);
    }

    public Map<String, Object> updateApproval(String id, Map<String, Object> payload) {
        return supabase.update("approvals", id, payload);
    }

    public List<Map<String, Object>> listPendingApprovals(int limit) {
        return supabase.listRecords("approvals", Map.of("status", "pending"), limit, null);
    }
}

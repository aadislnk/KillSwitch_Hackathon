package com.killswitch.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.killswitch.config.AppConfig;
import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class SupabaseService {
    private static final ParameterizedTypeReference<List<Map<String, Object>>> ROW_LIST =
        new ParameterizedTypeReference<>() {};

    @Qualifier("supabaseClient")
    private final WebClient supabaseClient;
    private final AppConfig appConfig;
    private final ObjectMapper objectMapper;

    public boolean isConfigured() {
        return hasText(appConfig.getSupabase().getUrl()) && hasText(appConfig.getSupabase().getServiceRoleKey());
    }

    public Map<String, Object> status() {
        return Map.of(
            "configured", isConfigured(),
            "url_present", hasText(appConfig.getSupabase().getUrl()),
            "service_role_key_present", hasText(appConfig.getSupabase().getServiceRoleKey())
        );
    }

    public List<Map<String, Object>> listRecords(String table, Map<String, Object> filters, int limit, String orderBy) {
        ensureConfigured();
        URI uri = buildUri(table, "*", filters, limit, orderBy);
        return nonNullRows(supabaseClient.get().uri(uri).retrieve().bodyToMono(ROW_LIST).block());
    }

    public List<Map<String, Object>> listRecords(String table, int limit, String orderBy) {
        return listRecords(table, Map.of(), limit, orderBy);
    }

    public Map<String, Object> getById(String table, String id) {
        List<Map<String, Object>> rows = listRecords(table, Map.of("id", id), 1, null);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public Map<String, Object> create(String table, Object body) {
        ensureConfigured();
        List<Map<String, Object>> rows = nonNullRows(supabaseClient.post()
            .uri("/rest/v1/" + table)
            .bodyValue(objectMapper.convertValue(body, Map.class))
            .retrieve()
            .bodyToMono(ROW_LIST)
            .block());
        return rows.isEmpty() ? null : rows.get(0);
    }

    public Map<String, Object> update(String table, String id, Object body) {
        ensureConfigured();
        List<Map<String, Object>> rows = nonNullRows(supabaseClient.patch()
            .uri("/rest/v1/" + table + "?id=eq." + id)
            .bodyValue(objectMapper.convertValue(body, Map.class))
            .retrieve()
            .bodyToMono(ROW_LIST)
            .block());
        return rows.isEmpty() ? null : rows.get(0);
    }

    public void delete(String table, String id) {
        ensureConfigured();
        supabaseClient.delete()
            .uri("/rest/v1/" + table + "?id=eq." + id)
            .retrieve()
            .toBodilessEntity()
            .block();
    }

    public long count(String table, Map<String, Object> filters) {
        return listRecords(table, filters, 1000, null).size();
    }

    private URI buildUri(String table, String select, Map<String, Object> filters, int limit, String orderBy) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromPath("/rest/v1/" + table)
            .queryParam("select", select);
        if (filters != null) {
            filters.forEach((key, value) -> {
                if (value != null && !value.toString().isBlank()) {
                    builder.queryParam(key, "eq." + value);
                }
            });
        }
        if (limit > 0) {
            builder.queryParam("limit", limit);
        }
        if (hasText(orderBy)) {
            builder.queryParam("order", orderBy + ".desc");
        }
        return builder.build(false).toUri();
    }

    private void ensureConfigured() {
        if (!isConfigured()) {
            throw new IllegalStateException("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
        }
    }

    private List<Map<String, Object>> nonNullRows(List<Map<String, Object>> rows) {
        return rows == null ? new ArrayList<>() : rows;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    public Map<String, Object> copy(Object body) {
        return new LinkedHashMap<>(objectMapper.convertValue(body, Map.class));
    }
}

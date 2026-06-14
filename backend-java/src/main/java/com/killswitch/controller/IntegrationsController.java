package com.killswitch.controller;

import com.killswitch.integration.AWSConnector;
import com.killswitch.model.dto.ConnectAWSRequest;
import com.killswitch.model.dto.ConnectGitHubRequest;
import com.killswitch.model.dto.ConnectStripeRequest;
import com.killswitch.model.dto.SlackConnectRequest;
import com.killswitch.service.DatabaseService;
import com.killswitch.service.SlackService;
import com.killswitch.service.SyncService;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/integrations")
@RequiredArgsConstructor
public class IntegrationsController {
    private final DatabaseService databaseService;
    private final SyncService syncService;
    private final SlackService slackService;
    private final AWSConnector awsConnector;

    @GetMapping({"", "/"})
    public Map<String, Object> listIntegrations(@RequestParam(defaultValue = "100") int limit) {
        try {
            return Map.of("integrations", databaseService.listIntegrations(limit));
        } catch (Exception e) {
            return Map.of("integrations", java.util.List.of(), "errors", java.util.List.of(e.getMessage()));
        }
    }

    @PostMapping("/github/connect")
    public Map<String, Object> connectGithub(@RequestBody ConnectGitHubRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("user_id", request.getUserId());
        payload.put("provider", "github");
        payload.put("status", "connected");
        payload.put("metadata", Map.of("org", request.getOrg()));
        Map<String, Object> integration = databaseService.createIntegration(payload);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("provider", "github");
        response.put("connected", true);
        response.put("integration", integration);
        response.put("message", "GitHub integration connected. Use /github/sync with integration_id, org, and token.");
        return response;
    }

    @GetMapping("/github/sync")
    public Map<String, Object> syncGithub(@RequestParam("integration_id") String integrationId,
        @RequestParam String org, @RequestParam String token) {
        return syncService.syncGitHub(integrationId, org, token);
    }

    @PostMapping("/aws/connect")
    public Map<String, Object> connectAws(@RequestBody ConnectAWSRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("user_id", request.getUserId());
        payload.put("provider", "aws");
        payload.put("status", "connected");
        payload.put("metadata", request.getMetadata() == null ? Map.of("region", request.getRegion()) : request.getMetadata());
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("provider", "aws");
        response.put("connected", true);
        response.put("integration", databaseService.createIntegration(payload));
        return response;
    }

    @GetMapping("/aws/sync")
    public Map<String, Object> syncAws(@RequestParam("integration_id") String integrationId,
        @RequestParam(defaultValue = "6") int count) {
        return syncService.syncAwsMock(integrationId, count);
    }

    @GetMapping("/aws/mock-data")
    public Map<String, Object> awsMockData(@RequestParam(defaultValue = "6") int count,
        @RequestParam(value = "integration_id", required = false) String integrationId,
        @RequestParam(defaultValue = "false") boolean store) {
        if (store && integrationId != null && !integrationId.isBlank()) {
            return syncService.syncAwsMock(integrationId, count);
        }
        var raw = awsConnector.fetchUsageData(count);
        return Map.of(
            "provider", "aws",
            "sample_response", AWSConnector.SAMPLE_AWS_MOCK_RESPONSE,
            "raw_records", raw,
            "normalized_records", raw
        );
    }

    @PostMapping("/stripe/connect")
    public Map<String, Object> connectStripe(@RequestBody ConnectStripeRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("user_id", request.getUserId());
        payload.put("provider", "stripe");
        payload.put("status", "connected");
        payload.put("metadata", Map.of("secret_stored", false));
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("provider", "stripe");
        response.put("connected", true);
        response.put("integration", databaseService.createIntegration(payload));
        return response;
    }

    @GetMapping("/stripe/sync")
    public Map<String, Object> syncStripe(@RequestParam("integration_id") String integrationId,
        @RequestParam("api_key") String apiKey) {
        return syncService.syncStripe(integrationId, apiKey);
    }

    @PostMapping("/slack/connect")
    public Map<String, Object> connectSlack(@RequestBody SlackConnectRequest request) {
        Map<String, Object> delivery = request.isSendTestAlert()
            ? slackService.sendAlert(request.getWebhookUrl(), "Slack webhook connected successfully.")
            : Map.of("delivered", false, "skipped", true);
        return Map.of(
            "provider", "slack",
            "connected", true,
            "delivery", delivery,
            "sample_alert", Map.of("text", "KillSwitch sample alert")
        );
    }
}

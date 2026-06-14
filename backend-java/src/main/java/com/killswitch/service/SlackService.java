package com.killswitch.service;

import com.killswitch.config.AppConfig;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class SlackService {
    private final AppConfig appConfig;
    @Qualifier("slackClient")
    private final WebClient slackClient;

    public Map<String, Object> sendAlert(String message) {
        return sendAlert(appConfig.getSlack().getWebhookUrl(), message);
    }

    public Map<String, Object> sendAlert(String webhookUrl, String message) {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            return Map.of("delivered", false, "skipped", true, "message", "Slack webhook URL is not configured.");
        }
        try {
            slackClient.post()
                .uri(webhookUrl)
                .bodyValue(Map.of("text", message))
                .retrieve()
                .toBodilessEntity()
                .block();
            return Map.of("delivered", true, "skipped", false);
        } catch (Exception e) {
            return Map.of("delivered", false, "skipped", false, "error", e.getMessage());
        }
    }
}

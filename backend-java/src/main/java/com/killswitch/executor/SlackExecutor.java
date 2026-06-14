package com.killswitch.executor;

import com.killswitch.service.SlackService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SlackExecutor {
    private final SlackService slackService;

    public Map<String, Object> execute(Map<String, Object> finding, String webhookUrl, String mode) {
        String message = "KillSwitch finding: " + finding.getOrDefault("reason", finding.get("finding_type"));
        if ("simulation".equals(mode) || "dry_run".equals(mode)) {
            return Map.of("executed", false, "mode", mode, "message", message, "execution_log", "Slack alert simulated.");
        }
        Map<String, Object> delivery = slackService.sendAlert(webhookUrl, message);
        return Map.of("executed", true, "mode", mode, "delivery", delivery, "execution_log", "Slack alert sent.");
    }
}

package com.killswitch.executor;

import com.killswitch.config.AppConfig;
import com.killswitch.integration.StripeConnector;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StripeExecutor {
    private final StripeConnector stripeConnector;
    private final AppConfig appConfig;

    public Map<String, Object> execute(Map<String, Object> finding, String mode) {
        String resourceId = String.valueOf(finding.getOrDefault("resource_id", ""));
        boolean dryRun = !"safe_execute".equals(mode);
        if (resourceId.isBlank()) {
            return Map.of("executed", false, "error", "Finding has no resource_id.");
        }
        return stripeConnector.cancelSubscription(appConfig.getStripe().getSecretKey(), resourceId, dryRun);
    }
}

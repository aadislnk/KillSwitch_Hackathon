package com.killswitch.executor;

import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class GitHubExecutor {
    public Map<String, Object> execute(Map<String, Object> finding, String mode) {
        return Map.of(
            "executed", false,
            "mode", mode,
            "resource_id", finding.getOrDefault("resource_id", ""),
            "execution_log", "GitHub seat removal is sandboxed; no seat was removed."
        );
    }
}

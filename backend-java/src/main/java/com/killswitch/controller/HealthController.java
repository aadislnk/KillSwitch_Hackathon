package com.killswitch.controller;

import com.killswitch.service.SupabaseService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HealthController {
    private final SupabaseService supabaseService;

    @GetMapping({"/health", "/api/v1/health"})
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @GetMapping({"/health/db", "/api/v1/health/db"})
    public Map<String, Object> databaseHealth() {
        Map<String, Object> status = supabaseService.status();
        if (!Boolean.TRUE.equals(status.get("configured"))) {
            return Map.of("status", "not_configured", "database", status);
        }
        return Map.of("status", "ok", "database", status);
    }
}

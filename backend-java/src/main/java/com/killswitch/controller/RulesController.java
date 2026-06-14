package com.killswitch.controller;

import com.killswitch.model.dto.CreateRuleRequest;
import com.killswitch.service.AutomationService;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rules")
@RequiredArgsConstructor
public class RulesController {
    private final AutomationService automationService;

    @GetMapping
    public Map<String, Object> listRules(@RequestParam(defaultValue = "100") int limit) {
        return automationService.listRules(limit);
    }

    @PostMapping
    public Map<String, Object> createRule(@RequestBody CreateRuleRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("user_id", request.getUserId());
        payload.put("condition_type", request.getConditionType());
        payload.put("threshold", String.valueOf(request.getThreshold()));
        payload.put("action", request.getAction());
        payload.put("approval_required", request.isApprovalRequired());
        payload.put("enabled", request.isEnabled());
        return automationService.createRule(payload);
    }

    @PatchMapping("/{id}")
    public Map<String, Object> updateRule(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        return automationService.updateRule(id, payload);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteRule(@PathVariable String id) {
        automationService.deleteRule(id);
        return Map.of("deleted", true);
    }
}

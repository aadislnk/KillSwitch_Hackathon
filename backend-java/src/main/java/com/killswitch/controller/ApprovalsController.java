package com.killswitch.controller;

import com.killswitch.service.AutomationService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/approvals")
@RequiredArgsConstructor
public class ApprovalsController {
    private final AutomationService automationService;

    @GetMapping
    public Map<String, Object> listApprovals(@RequestParam(defaultValue = "100") int limit) {
        return automationService.listPendingApprovals(limit);
    }

    @PostMapping("/{id}/approve")
    public Map<String, Object> approve(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        String approvedBy = body == null || body.get("approved_by") == null ? null : String.valueOf(body.get("approved_by"));
        return automationService.approve(id, approvedBy);
    }

    @PostMapping("/{id}/reject")
    public Map<String, Object> reject(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        String approvedBy = body == null || body.get("approved_by") == null ? null : String.valueOf(body.get("approved_by"));
        return automationService.reject(id, approvedBy);
    }
}

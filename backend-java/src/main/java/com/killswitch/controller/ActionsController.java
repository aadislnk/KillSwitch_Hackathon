package com.killswitch.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.killswitch.service.AutomationService;
import java.util.Map;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/actions")
@RequiredArgsConstructor
public class ActionsController {
    private final AutomationService automationService;

    @PostMapping({"/run", "/execute"})
    public Map<String, Object> runAction(@RequestBody RunActionRequest request) {
        return automationService.runAction(
            request.getFindingId(),
            request.getActionType(),
            request.getExecutionMode() == null ? "dry_run" : request.getExecutionMode(),
            request.getSlackWebhookUrl(),
            request.getRecipientEmail()
        );
    }

    @GetMapping({"/logs", ""})
    public Map<String, Object> listActionLogs(@RequestParam(defaultValue = "100") int limit) {
        return automationService.listActionLogs(limit);
    }

    @GetMapping("/{id}")
    public Map<String, Object> getAction(@PathVariable String id) {
        Map<String, Object> action = automationService.getAction(id);
        if (action == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Action not found");
        }
        return action;
    }

    @Data
    public static class RunActionRequest {
        @JsonProperty("finding_id")
        private String findingId;
        @JsonProperty("action_type")
        private String actionType;
        @JsonProperty("execution_mode")
        private String executionMode = "dry_run";
        @JsonProperty("slack_webhook_url")
        private String slackWebhookUrl;
        @JsonProperty("recipient_email")
        private String recipientEmail;
    }
}

package com.killswitch.controller;

import com.killswitch.service.FindingsService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/findings")
@RequiredArgsConstructor
public class FindingsController {
    private final FindingsService findingsService;

    @GetMapping
    public Map<String, Object> getFindings(
        @RequestParam(defaultValue = "100") int limit,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String severity
    ) {
        return findingsService.listFindingsEnvelope(limit, status, severity);
    }

    @GetMapping("/{id}")
    public Map<String, Object> getFinding(@PathVariable String id) {
        Map<String, Object> finding = findingsService.getFindingById(id);
        if (finding == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Finding not found");
        }
        return finding;
    }

    @PostMapping({"/run-analysis", "/analyze"})
    public Map<String, Object> runAnalysis(@RequestBody(required = false) Map<String, Object> body,
        @RequestParam(required = false) Boolean enrich) {
        String integrationId = body == null || body.get("integration_id") == null ? null : String.valueOf(body.get("integration_id"));
        int limit = body == null || body.get("limit") == null ? 500 : Integer.parseInt(String.valueOf(body.get("limit")));
        boolean resolvedEnrich = enrich != null ? enrich
            : body == null || body.get("enrich") == null || Boolean.parseBoolean(String.valueOf(body.get("enrich")));
        return findingsService.runAnalysis(integrationId, Math.max(1, Math.min(limit, 1000)), resolvedEnrich);
    }

    @PatchMapping("/{id}/status")
    public Map<String, Object> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return findingsService.updateStatus(id, body.get("status"));
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteFinding(@PathVariable String id) {
        findingsService.deleteFinding(id);
        return Map.of("deleted", true);
    }
}

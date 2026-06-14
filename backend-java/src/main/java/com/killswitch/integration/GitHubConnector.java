package com.killswitch.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.killswitch.model.SpendRecord;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class GitHubConnector {
    @Qualifier("githubClient")
    private final WebClient githubClient;
    private final ObjectMapper objectMapper;

    public List<SpendRecord> fetchOrgMembers(String org, String token) {
        List<SpendRecord> records = new ArrayList<>();
        try {
            String response = githubClient.get()
                .uri("/orgs/" + org + "/members")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            JsonNode members = objectMapper.readTree(response);
            for (JsonNode member : members) {
                String login = member.path("login").asText();
                OffsetDateTime lastUsed = fetchLastActivity(login, token);
                long daysSinceActive = lastUsed != null
                    ? java.time.temporal.ChronoUnit.DAYS.between(lastUsed, OffsetDateTime.now())
                    : 999;
                SpendRecord record = new SpendRecord();
                record.setToolName(login);
                record.setResourceType("github_user_seat");
                record.setMonthlyCost(BigDecimal.valueOf(21));
                record.setUsageScore((int) Math.max(0, 100 - daysSinceActive * 2));
                record.setLastUsed(lastUsed);
                records.add(record);
            }
        } catch (Exception e) {
            log.warn("GitHub fetchOrgMembers failed for org={}: {}", org, e.getMessage());
        }
        return records;
    }

    private OffsetDateTime fetchLastActivity(String login, String token) {
        try {
            String response = githubClient.get()
                .uri("/users/" + login + "/events/public?per_page=1")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            JsonNode events = objectMapper.readTree(response);
            if (events.isArray() && events.size() > 0) {
                return OffsetDateTime.parse(events.get(0).path("created_at").asText());
            }
        } catch (Exception e) {
            log.debug("Could not fetch last activity for {}: {}", login, e.getMessage());
        }
        return null;
    }
}

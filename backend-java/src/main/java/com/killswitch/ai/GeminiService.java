package com.killswitch.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.killswitch.config.AppConfig;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final AppConfig appConfig;
    private final ObjectMapper objectMapper;

    public String complete(String prompt) {
        String apiKey = appConfig.getGemini().getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }
        Map<String, Object> requestBody = Map.of(
            "contents", new Object[] {Map.of("parts", new Object[] {Map.of("text", prompt)})},
            "generationConfig", Map.of("temperature", 0.3, "maxOutputTokens", 1000)
        );
        try {
            String response = WebClient.create()
                .post()
                .uri(GEMINI_URL + appConfig.getGemini().getModel() + ":generateContent?key=" + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            var root = objectMapper.readTree(response);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            log.warn("Gemini API call failed: {}", e.getMessage());
            return null;
        }
    }

    public Map<String, String> enrichFinding(Map<String, Object> finding) {
        String raw = complete(PromptBuilder.buildEnrichmentPrompt(finding));
        if (raw == null || raw.isBlank()) {
            return Map.of();
        }
        try {
            String cleaned = raw.replace("```json", "").replace("```", "").trim();
            return objectMapper.readValue(cleaned,
                objectMapper.getTypeFactory().constructMapType(Map.class, String.class, String.class));
        } catch (Exception e) {
            return Map.of("explanation", raw);
        }
    }
}

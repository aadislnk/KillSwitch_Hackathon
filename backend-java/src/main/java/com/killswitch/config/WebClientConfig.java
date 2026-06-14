package com.killswitch.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@RequiredArgsConstructor
public class WebClientConfig {
    private final AppConfig appConfig;

    @Bean("supabaseClient")
    public WebClient supabaseClient() {
        WebClient.Builder builder = WebClient.builder()
            .defaultHeader("Content-Type", "application/json")
            .defaultHeader("Prefer", "return=representation");

        String url = appConfig.getSupabase().getUrl();
        if (url != null && !url.isBlank()) {
            builder.baseUrl(url);
        }
        String key = appConfig.getSupabase().getServiceRoleKey();
        if (key != null && !key.isBlank()) {
            builder.defaultHeader("apikey", key);
            builder.defaultHeader("Authorization", "Bearer " + key);
        }
        return builder.build();
    }

    @Bean("githubClient")
    public WebClient githubClient() {
        return WebClient.builder()
            .baseUrl("https://api.github.com")
            .defaultHeader("Accept", "application/vnd.github+json")
            .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
            .build();
    }

    @Bean("slackClient")
    public WebClient slackClient() {
        return WebClient.builder().build();
    }
}

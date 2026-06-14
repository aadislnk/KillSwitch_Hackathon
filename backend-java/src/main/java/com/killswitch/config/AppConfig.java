package com.killswitch.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "killswitch")
public class AppConfig {
    private Supabase supabase = new Supabase();
    private Gemini gemini = new Gemini();
    private Github github = new Github();
    private Stripe stripe = new Stripe();
    private Slack slack = new Slack();
    private Aws aws = new Aws();
    private Encryption encryption = new Encryption();
    private Scheduler scheduler = new Scheduler();
    private App app = new App();

    @Data
    public static class Supabase {
        private String url = "";
        private String anonKey = "";
        private String serviceRoleKey = "";
    }

    @Data
    public static class Gemini {
        private String apiKey = "";
        private String model = "gemini-2.5-flash";
    }

    @Data
    public static class Github {
        private String token = "";
    }

    @Data
    public static class Stripe {
        private String secretKey = "";
    }

    @Data
    public static class Slack {
        private String webhookUrl = "";
    }

    @Data
    public static class Aws {
        private String accessKey = "";
        private String secretKey = "";
        private String region = "us-east-1";
    }

    @Data
    public static class Encryption {
        private String key = "your-32-char-secret-key-here!!!!";
    }

    @Data
    public static class Scheduler {
        private String timezone = "UTC";
        private int syncIntervalHours = 6;
        private int analysisIntervalHours = 6;
        private int ruleEngineIntervalHours = 1;
    }

    @Data
    public static class App {
        private String env = "development";
    }
}

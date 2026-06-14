package com.killswitch.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.UUID;
import lombok.Data;

@Data
public class ConnectAWSRequest {
    @JsonProperty("user_id")
    private UUID userId;
    @JsonProperty("access_key")
    private String accessKey;
    @JsonProperty("secret_key")
    private String secretKey;
    private String region = "us-east-1";
    private Map<String, Object> metadata;
}

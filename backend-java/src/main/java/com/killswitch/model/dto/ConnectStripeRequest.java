package com.killswitch.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;
import lombok.Data;

@Data
public class ConnectStripeRequest {
    @JsonProperty("user_id")
    private UUID userId;
    @JsonProperty("api_key")
    private String apiKey;
}

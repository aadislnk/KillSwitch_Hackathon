package com.killswitch.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;
import lombok.Data;

@Data
public class ConnectGitHubRequest {
    @JsonProperty("user_id")
    private UUID userId;
    @NotBlank
    private String org;
    @NotBlank
    private String token;
}

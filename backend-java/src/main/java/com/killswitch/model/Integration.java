package com.killswitch.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Integration {
    private UUID id;
    @JsonProperty("user_id")
    private UUID userId;
    private String provider;
    private String status;
    @JsonProperty("last_sync")
    private OffsetDateTime lastSync;
    private Map<String, Object> metadata;
    @JsonProperty("created_at")
    private OffsetDateTime createdAt;
}

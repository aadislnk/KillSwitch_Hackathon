package com.killswitch.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rule {
    private UUID id;
    @JsonProperty("user_id")
    private UUID userId;
    @JsonProperty("condition_type")
    private String conditionType;
    private String threshold;
    private String action;
    @JsonProperty("approval_required")
    private boolean approvalRequired;
    private boolean enabled;
    @JsonProperty("created_at")
    private OffsetDateTime createdAt;
}

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
public class Approval {
    private UUID id;
    @JsonProperty("finding_id")
    private UUID findingId;
    @JsonProperty("action_id")
    private UUID actionId;
    private String status;
    @JsonProperty("risk_level")
    private String riskLevel;
    @JsonProperty("recommended_action")
    private String recommendedAction;
    @JsonProperty("approved_by")
    private UUID approvedBy;
    @JsonProperty("approved_at")
    private OffsetDateTime approvedAt;
    @JsonProperty("created_at")
    private OffsetDateTime createdAt;
}

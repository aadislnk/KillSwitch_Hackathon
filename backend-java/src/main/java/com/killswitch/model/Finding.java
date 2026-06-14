package com.killswitch.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
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
public class Finding {
    private UUID id;
    @JsonProperty("resource_id")
    private String resourceId;
    @JsonProperty("finding_type")
    private String findingType;
    private String severity;
    private Double confidence;
    @JsonProperty("estimated_savings")
    private BigDecimal estimatedSavings;
    @JsonProperty("recommended_action")
    private String recommendedAction;
    private String reason;
    private String explanation;
    @JsonProperty("risk_summary")
    private String riskSummary;
    @JsonProperty("optimization_recommendation")
    private String optimizationRecommendation;
    private String status;
    private String provider;
    @JsonProperty("created_at")
    private OffsetDateTime createdAt;
}

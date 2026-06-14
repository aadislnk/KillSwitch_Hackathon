package com.killswitch.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;
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
public class SpendRecord {
    private UUID id;
    @JsonProperty("integration_id")
    private UUID integrationId;
    @JsonProperty("tool_name")
    private String toolName;
    @JsonProperty("monthly_cost")
    private BigDecimal monthlyCost;
    @JsonProperty("usage_score")
    private Integer usageScore;
    @JsonProperty("last_used")
    private OffsetDateTime lastUsed;
    @JsonProperty("resource_type")
    private String resourceType;
    @JsonProperty("snapshot_date")
    private LocalDate snapshotDate;
    @JsonProperty("created_at")
    private OffsetDateTime createdAt;
}

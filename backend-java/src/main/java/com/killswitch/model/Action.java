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
public class Action {
    private UUID id;
    @JsonProperty("finding_id")
    private UUID findingId;
    @JsonProperty("action_type")
    private String actionType;
    private String status;
    @JsonProperty("executed_at")
    private OffsetDateTime executedAt;
    private BigDecimal savings;
    @JsonProperty("execution_mode")
    private String executionMode;
    @JsonProperty("execution_log")
    private String executionLog;
    @JsonProperty("execution_result")
    private String executionResult;
    @JsonProperty("rollback_status")
    private String rollbackStatus;
    @JsonProperty("created_at")
    private OffsetDateTime createdAt;
}

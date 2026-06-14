package com.killswitch.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;
import lombok.Data;

@Data
public class CreateRuleRequest {
    @JsonProperty("user_id")
    private UUID userId;
    @JsonProperty("condition_type")
    private String conditionType;
    private Object threshold;
    private String action;
    @JsonProperty("approval_required")
    private boolean approvalRequired = true;
    private boolean enabled = true;
}

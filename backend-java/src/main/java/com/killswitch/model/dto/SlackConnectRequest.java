package com.killswitch.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SlackConnectRequest {
    @JsonProperty("webhook_url")
    private String webhookUrl;
    @JsonProperty("send_test_alert")
    private boolean sendTestAlert = true;
}

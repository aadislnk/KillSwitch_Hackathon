package com.killswitch.integration;

import com.killswitch.model.SpendRecord;
import com.stripe.Stripe;
import com.stripe.model.Subscription;
import com.stripe.model.SubscriptionCollection;
import com.stripe.param.SubscriptionListParams;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StripeConnector {
    public List<SpendRecord> fetchSubscriptions(String apiKey) {
        Stripe.apiKey = apiKey;
        List<SpendRecord> records = new ArrayList<>();
        try {
            SubscriptionCollection subscriptions = Subscription.list(
                SubscriptionListParams.builder()
                    .setStatus(SubscriptionListParams.Status.ACTIVE)
                    .setLimit(100L)
                    .build()
            );
            for (Subscription sub : subscriptions.getData()) {
                BigDecimal monthlyCost = BigDecimal.ZERO;
                for (var item : sub.getItems().getData()) {
                    long unitAmount = item.getPrice().getUnitAmount() == null ? 0 : item.getPrice().getUnitAmount();
                    String interval = item.getPrice().getRecurring() == null ? "month" : item.getPrice().getRecurring().getInterval();
                    BigDecimal amount = BigDecimal.valueOf(unitAmount).divide(BigDecimal.valueOf(100));
                    if ("year".equals(interval)) {
                        amount = amount.divide(BigDecimal.valueOf(12), 2, java.math.RoundingMode.HALF_UP);
                    }
                    monthlyCost = monthlyCost.add(amount);
                }
                SpendRecord record = new SpendRecord();
                record.setToolName(sub.getDescription() != null ? sub.getDescription() : sub.getId());
                record.setResourceType("stripe_subscription");
                record.setMonthlyCost(monthlyCost);
                record.setUsageScore(80);
                record.setLastUsed(OffsetDateTime.ofInstant(
                    Instant.ofEpochSecond(sub.getCurrentPeriodStart()), ZoneOffset.UTC));
                records.add(record);
            }
        } catch (Exception e) {
            log.warn("Stripe fetchSubscriptions failed: {}", e.getMessage());
        }
        return records;
    }

    public Map<String, Object> cancelSubscription(String apiKey, String subscriptionId, boolean dryRun) {
        if (dryRun) {
            return Map.of(
                "cancelled", false,
                "dry_run", true,
                "subscription_id", subscriptionId,
                "message", "Dry run: not cancelled. Set dry_run=false to execute."
            );
        }
        Stripe.apiKey = apiKey;
        try {
            Subscription sub = Subscription.retrieve(subscriptionId);
            sub.cancel();
            return Map.of("cancelled", true, "subscription_id", subscriptionId);
        } catch (Exception e) {
            return Map.of("cancelled", false, "error", e.getMessage());
        }
    }
}

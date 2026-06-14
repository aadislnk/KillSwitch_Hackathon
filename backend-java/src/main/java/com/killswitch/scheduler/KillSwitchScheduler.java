package com.killswitch.scheduler;

import com.killswitch.service.FindingsService;
import com.killswitch.service.SyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KillSwitchScheduler {
    private final SyncService syncService;
    private final FindingsService findingsService;

    @Scheduled(fixedRateString = "#{${killswitch.scheduler.sync-interval-hours} * 3600000}")
    public void syncAllIntegrations() {
        try {
            syncService.syncAll();
        } catch (Exception e) {
            log.debug("Scheduled sync skipped: {}", e.getMessage());
        }
    }

    @Scheduled(fixedRateString = "#{${killswitch.scheduler.analysis-interval-hours} * 3600000}",
        initialDelayString = "900000")
    public void runAiAnalysis() {
        try {
            findingsService.runAnalysis(true);
        } catch (Exception e) {
            log.debug("Scheduled analysis skipped: {}", e.getMessage());
        }
    }

    @Scheduled(fixedRateString = "#{${killswitch.scheduler.rule-engine-interval-hours} * 3600000}")
    public void runRuleEngine() {
        try {
            findingsService.applyRules();
        } catch (Exception e) {
            log.debug("Scheduled rule engine skipped: {}", e.getMessage());
        }
    }
}

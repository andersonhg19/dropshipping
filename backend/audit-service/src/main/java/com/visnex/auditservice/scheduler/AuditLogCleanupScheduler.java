package com.visnex.auditservice.scheduler;

import com.visnex.auditservice.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditLogCleanupScheduler {
    
    private final AuditLogService auditLogService;
    
    @Scheduled(cron = "${audit.retention.cleanup-cron:0 0 2 * * ?}")
    public void cleanupOldAuditLogs() {
        auditLogService.cleanupOldRecords();
    }
}


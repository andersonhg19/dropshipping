package com.visnex.auditservice.mapper;

import com.visnex.auditservice.dto.input.AuditLogCreateDTO;
import com.visnex.auditservice.dto.output.ResultAuditLogDTO;
import com.visnex.auditservice.entity.AuditLog;
import com.visnex.auditservice.util.EnrichmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditLogMapper {
    
    private final EnrichmentService enrichmentService;
    
    public AuditLog toEntity(AuditLogCreateDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return AuditLog.builder()
                .companyId(dto.getCompanyId())
                .subsidiaryId(dto.getSubsidiaryId())
                .actorUserId(dto.getActorUserId())
                .actorUsername(dto.getActorUsername())
                .entityType(dto.getEntityType())
                .entityId(dto.getEntityId())
                .action(dto.getAction() != null && !dto.getAction().isBlank() ? 
                        AuditLog.Action.valueOf(dto.getAction().toUpperCase()) : null)
                .module(dto.getModule())
                .timestamp(java.time.LocalDateTime.now())
                .build();
    }
    
    public ResultAuditLogDTO toDTO(AuditLog auditLog) {
        if (auditLog == null) {
            return null;
        }
        
        ResultAuditLogDTO dto = ResultAuditLogDTO.builder()
                .id(auditLog.getId())
                .companyId(auditLog.getCompanyId())
                .subsidiaryId(auditLog.getSubsidiaryId())
                .actorUserId(auditLog.getActorUserId())
                .actorUsername(auditLog.getActorUsername())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .action(auditLog.getAction() != null ? auditLog.getAction().name() : null)
                .changes(auditLog.getChanges())
                .module(auditLog.getModule())
                .timestamp(auditLog.getTimestamp())
                .build();
        
        // Enriquecer datos
        String language = "es"; // Default
        dto.setCompanyName(enrichmentService.getCompanyName(auditLog.getCompanyId(), language));
        dto.setSubsidiaryName(enrichmentService.getSubsidiaryName(auditLog.getSubsidiaryId(), language));
        dto.setActorFullName(enrichmentService.getUserFullName(auditLog.getActorUserId(), language));
        dto.setActionDisplayName(enrichmentService.getActionDisplayName(
                auditLog.getAction() != null ? auditLog.getAction().name() : null, language));
        dto.setEntityDisplayName(enrichmentService.getEntityDisplayName(
                auditLog.getEntityType(), auditLog.getEntityId()));
        
        // Asegurar que changes nunca sea null - usar "[]" si es null o vacío
        String changes = auditLog.getChanges();
        if (changes == null || changes.isBlank() || changes.equals("null")) {
            changes = "[]";
            dto.setChanges(changes);
        }
        
        dto.setChangesCount(enrichmentService.getChangesCount(changes));
        dto.setTimeAgo(enrichmentService.getTimeAgo(auditLog.getTimestamp()));
        
        return dto;
    }
}


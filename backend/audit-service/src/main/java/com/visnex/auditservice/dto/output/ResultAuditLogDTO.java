package com.visnex.auditservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Audit Log response data with enriched information")
public class ResultAuditLogDTO {
    
    @Schema(description = "Primary key", example = "1")
    private Long id;
    
    @Schema(description = "Company ID", example = "1")
    private Long companyId;
    
    @Schema(description = "Company name (enriched)", example = "My Company")
    private String companyName;
    
    @Schema(description = "Subsidiary ID", example = "2")
    private Long subsidiaryId;
    
    @Schema(description = "Subsidiary name (enriched)", example = "Subsidiary Norte")
    private String subsidiaryName;
    
    @Schema(description = "Actor User ID", example = "5")
    private Long actorUserId;
    
    @Schema(description = "Actor Username", example = "admin")
    private String actorUsername;
    
    @Schema(description = "Actor full name (enriched)", example = "Admin User")
    private String actorFullName;
    
    @Schema(description = "Entity Type", example = "MedicalTransaction")
    private String entityType;
    
    @Schema(description = "Entity ID", example = "100")
    private Long entityId;
    
    @Schema(description = "Entity display name (enriched)", example = "Transaction #100")
    private String entityDisplayName;
    
    @Schema(description = "Action", example = "UPDATE")
    private String action;
    
    @Schema(description = "Action display name (enriched)", example = "Actualización")
    private String actionDisplayName;
    
    @Schema(description = "Changes (JSON)", example = "[{\"field\":\"name\",\"oldValue\":\"Juan\",\"newValue\":\"Pedro\"}]")
    private String changes;
    
    @Schema(description = "Changes count (computed)", example = "3")
    private Integer changesCount;
    
    @Schema(description = "Module", example = "Health")
    private String module;
    
    @Schema(description = "Timestamp", example = "2025-01-15T10:30:00")
    private LocalDateTime timestamp;
    
    @Schema(description = "Time ago (human readable)", example = "2 hours ago")
    private String timeAgo;
}


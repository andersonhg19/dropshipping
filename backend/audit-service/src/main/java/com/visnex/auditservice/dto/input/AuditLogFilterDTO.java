package com.visnex.auditservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Schema(name = "AuditLogFilterDTO", description = "DTO used to filter and paginate AuditLog records")
public class AuditLogFilterDTO {
    
    @Schema(description = "Primary key for direct lookup", example = "1")
    private Long id;
    
    @Schema(description = "Page number starting at 0", example = "0", required = true)
    private Integer page;
    
    @Schema(description = "Number of records per page", example = "20", required = true)
    private Integer size;
    
    @Schema(description = "Company ID", example = "1")
    private Long companyId;
    
    @Schema(description = "Subsidiary ID", example = "2")
    private Long subsidiaryId;
    
    @Schema(description = "Actor User ID", example = "5")
    private Long actorUserId;
    
    @Schema(description = "Entity Type", example = "MedicalTransaction")
    private String entityType;
    
    @Schema(description = "Entity ID", example = "100")
    private Long entityId;
    
    @Schema(description = "Action", example = "UPDATE")
    private String action;
    
    @Schema(description = "Module", example = "Health")
    private String module;
    
    @Schema(description = "Start date", example = "2025-01-01T00:00:00")
    private LocalDateTime startDate;
    
    @Schema(description = "End date", example = "2025-12-31T23:59:59")
    private LocalDateTime endDate;
}


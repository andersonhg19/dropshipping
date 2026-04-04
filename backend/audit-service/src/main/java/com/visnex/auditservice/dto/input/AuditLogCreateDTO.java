package com.visnex.auditservice.dto.input;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogCreateDTO {
    private Long companyId;
    private Long subsidiaryId;
    private Long actorUserId;
    private String actorUsername;
    private String entityType;
    private Long entityId;
    private String action; // "CREATE", "UPDATE", "DELETE", etc.
    private List<Map<String, Object>> changes; // Se serializa a JSON
    private String module;
}


package com.visnex.administrationservice.dto.input;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String action;
    private List<Map<String, Object>> changes;
    private String module;
    private String ipAddress;
}


package com.visnex.auditservice.service;

import com.visnex.auditservice.dto.input.AuditLogCreateDTO;
import com.visnex.auditservice.dto.input.AuditLogFilterDTO;
import com.visnex.auditservice.dto.output.PageDTO;
import com.visnex.auditservice.dto.output.ResultAuditLogDTO;
import com.visnex.auditservice.dto.output.ResultDTO;

public interface AuditLogService {
    ResultDTO create(AuditLogCreateDTO dto, String language);
    ResultDTO getAllItems(AuditLogFilterDTO filterDTO, String language);
    void cleanupOldRecords();
}


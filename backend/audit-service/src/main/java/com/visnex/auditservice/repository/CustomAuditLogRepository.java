package com.visnex.auditservice.repository;

import com.visnex.auditservice.dto.input.AuditLogFilterDTO;
import com.visnex.auditservice.dto.output.ResultAuditLogDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomAuditLogRepository {
    Page<ResultAuditLogDTO> findAllWithCriteria(AuditLogFilterDTO filterDTO, Pageable pageable);
}


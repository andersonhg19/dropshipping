package com.visnex.auditservice.client;

import com.visnex.auditservice.dto.input.AuditLogCreateDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "audit-service", url = "${audit.microservice.url:http://gateway-service:8820/AUDIT-SERVICE/vn-api}")
public interface AuditLogClient {
    
    @PostMapping("/v2/audit-log/create")
    void createAuditLog(
        @RequestBody AuditLogCreateDTO dto,
        @RequestHeader(value = "lng", required = false) String language
    );
}


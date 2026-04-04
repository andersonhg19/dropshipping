package com.visnex.administrationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import com.visnex.administrationservice.dto.input.AuditLogCreateDTO;

@FeignClient(name = "audit-service", url = "${auditMicroserviceUrl:http://gateway-service:8841/AUDIT-SERVICE/vn-api}")
public interface AuditLogClient {
    
    @PostMapping("/v2/audit-log/create")
    void createAuditLog(
        @RequestBody AuditLogCreateDTO dto,
        @RequestHeader(value = "lng", required = false) String language
    );
}


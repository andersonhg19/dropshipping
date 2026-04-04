package com.visnex.auditservice.controller;

import com.visnex.auditservice.dto.input.AuditLogCreateDTO;
import com.visnex.auditservice.dto.input.AuditLogFilterDTO;
import com.visnex.auditservice.dto.output.ResultDTO;
import com.visnex.auditservice.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v2/audit-log")
@RequiredArgsConstructor
@Tag(name = "Audit Log", description = "API for audit logging")
public class AuditLogController {
    
    private final AuditLogService service;
    
    @Operation(summary = "Create audit log entry")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Audit log created successfully",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
        @ApiResponse(responseCode = "403", description = "Invalid headers or body", content = @Content),
        @ApiResponse(responseCode = "102", description = "Validation error", content = @Content)
    })
    @PostMapping("/create")
    public ResultDTO create(@RequestBody AuditLogCreateDTO dto,
                           @RequestHeader(name = "lng", required = false) String language) {
        return service.create(dto, language);
    }
    
    @Operation(summary = "Get all audit logs with filters")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved audit logs",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
        @ApiResponse(responseCode = "403", description = "Invalid headers or body", content = @Content),
        @ApiResponse(responseCode = "102", description = "Validation error", content = @Content)
    })
    @PostMapping("/all")
    public ResultDTO getAll(@RequestBody AuditLogFilterDTO filter,
                           @RequestHeader(name = "lng", required = false) String language) {
        return service.getAllItems(filter, language);
    }
}


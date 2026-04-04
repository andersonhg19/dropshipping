package com.visnex.auditservice.service.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.auditservice.dto.input.AuditLogCreateDTO;
import com.visnex.auditservice.dto.input.AuditLogFilterDTO;
import com.visnex.auditservice.dto.output.PageDTO;
import com.visnex.auditservice.dto.output.ResultAuditLogDTO;
import com.visnex.auditservice.dto.output.ResultDTO;
import com.visnex.auditservice.entity.AuditLog;
import com.visnex.auditservice.mapper.AuditLogMapper;
import com.visnex.auditservice.repository.AuditLogRepository;
import com.visnex.auditservice.repository.CustomAuditLogRepository;
import com.visnex.auditservice.security.ConnectInternalApi;
import com.visnex.auditservice.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {
    
    private final AuditLogRepository repository;
    private final CustomAuditLogRepository customRepository;
    private final AuditLogMapper mapper;
    private final ConnectInternalApi connectInternalApi;
    private final ObjectMapper objectMapper;
    
    @Value("${audit.retention.max-records:1000000}")
    private long maxRecords;
    
    @Value("${audit.retention.cleanup-batch-size:10000}")
    private int cleanupBatchSize;
    
    @Value("${audit.retention.cleanup-enabled:true}")
    private boolean cleanupEnabled;
    
    private static final String DEFAULT_LANG = "es";
    
    private String lang(String language) {
        return (language == null || language.isBlank()) ? DEFAULT_LANG : language;
    }
    
    private String m(String key, String lng) {
        try {
            return connectInternalApi.chargeMessage(key, lng);
        } catch (Exception e) {
            return key;
        }
    }
    
    @Override
    @Transactional
    public ResultDTO create(AuditLogCreateDTO dto, String language) {
        final String lng = lang(language);
        try {
            if (dto == null) {
                return new ResultDTO(false, m("bodyRequired", lng), 103);
            }
            
            // Validaciones requeridas
            if (dto.getCompanyId() == null || dto.getCompanyId() <= 0) {
                return new ResultDTO(false, m("return_field_is_required", lng) + ": companyId", 103);
            }
            if (dto.getActorUserId() == null || dto.getActorUserId() <= 0) {
                return new ResultDTO(false, m("return_field_is_required", lng) + ": actorUserId", 103);
            }
            if (dto.getEntityType() == null || dto.getEntityType().isBlank()) {
                return new ResultDTO(false, m("return_field_is_required", lng) + ": entityType", 103);
            }
            if (dto.getEntityId() == null || dto.getEntityId() <= 0) {
                return new ResultDTO(false, m("return_field_is_required", lng) + ": entityId", 103);
            }
            if (dto.getAction() == null || dto.getAction().isBlank()) {
                return new ResultDTO(false, m("return_field_is_required", lng) + ": action", 103);
            }
            if (dto.getModule() == null || dto.getModule().isBlank()) {
                return new ResultDTO(false, m("return_field_is_required", lng) + ": module", 103);
            }
            
            // Validar que action sea válido
            try {
                AuditLog.Action.valueOf(dto.getAction().toUpperCase());
            } catch (IllegalArgumentException e) {
                return new ResultDTO(false, m("return_process_error", lng) + 
                        ": Invalid action. Valid values: CREATE, UPDATE, DELETE, READ, EXPORT, IMPORT, LOGIN, LOGOUT, PERMISSION_CHANGE", 103);
            }
            
            // Serializar changes a JSON - siempre serializar, incluso si está vacío
            String changesJson = "[]"; // Default: array vacío
            if (dto.getChanges() != null && !dto.getChanges().isEmpty()) {
                try {
                    changesJson = objectMapper.writeValueAsString(dto.getChanges());
                } catch (JsonProcessingException e) {
                    System.err.println("Error serializing changes: " + e.getMessage());
                    changesJson = "[]"; // Fallback a array vacío
                }
            }
            
            AuditLog entity = mapper.toEntity(dto);
            entity.setChanges(changesJson);
            
            AuditLog saved = repository.save(entity);
            ResultAuditLogDTO result = mapper.toDTO(saved);
            
            return new ResultDTO(true, m("auditLogCreated", lng), 0, result);
        } catch (Exception e) {
            return new ResultDTO(false, m("return_error", lng) + ": " + e.getMessage(), 102);
        }
    }
    
    @Override
    public ResultDTO getAllItems(AuditLogFilterDTO filterDTO, String language) {
        final String lng = lang(language);
        try {
            if (filterDTO == null || filterDTO.getPage() == null || filterDTO.getSize() == null) {
                return new ResultDTO(false, m("bodyRequired", lng), 103);
            }
            
            int page = filterDTO.getPage();
            int size = filterDTO.getSize();
            
            Page<ResultAuditLogDTO> pageResult = customRepository.findAllWithCriteria(
                    filterDTO, PageRequest.of(page, size));
            
            if (pageResult.getContent().isEmpty()) {
                return new ResultDTO(new PageDTO<>(page, size, 0, Collections.emptyList()));
            }
            
            return new ResultDTO(new PageDTO<>(page, size, pageResult.getTotalPages(), pageResult.getContent()));
        } catch (Exception e) {
            return new ResultDTO(false, m("return_error", lng) + ": " + e.getMessage(), 102);
        }
    }
    
    @Override
    @Transactional
    public void cleanupOldRecords() {
        if (!cleanupEnabled) {
            return;
        }
        
        try {
            long currentCount = repository.countAll();
            
            if (currentCount > maxRecords) {
                long recordsToDelete = currentCount - maxRecords;
                int batches = (int) Math.ceil((double) recordsToDelete / cleanupBatchSize);
                
                System.out.println("Starting audit log cleanup. Current records: " + currentCount + 
                                 ", Max allowed: " + maxRecords + ", Will delete: " + recordsToDelete);
                
                for (int i = 0; i < batches; i++) {
                    int deleted = repository.deleteOldestBatch(cleanupBatchSize);
                    System.out.println("Deleted batch " + (i + 1) + "/" + batches + ": " + deleted + " records");
                    
                    if (deleted == 0) {
                        break; // No more records to delete
                    }
                }
                
                long finalCount = repository.countAll();
                System.out.println("Cleanup completed. Final record count: " + finalCount);
            }
        } catch (Exception e) {
            System.err.println("Error during audit log cleanup: " + e.getMessage());
            e.printStackTrace();
        }
    }
}


package com.visnex.administrationservice.util;

import java.lang.reflect.Method;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.visnex.administrationservice.client.AuditLogClient;
import com.visnex.administrationservice.dto.input.AuditLogCreateDTO;
import com.visnex.administrationservice.security.ConnectInternalApi;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AuditLogPublisher {
    
    private final AuditLogClient auditLogClient;
    private final ConnectInternalApi connectInternalApi;
    
    @Async
    @EventListener
    public void handleEntityChangeEvent(EntityChangeEvent event) {
        if (auditLogClient == null) {
            return;
        }
        
        try {
            Object entity = event.getEntity();
            if (entity == null) {
                return;
            }
            
            // Normalizar changes: si es null, usar lista vacía
            List<Map<String, Object>> changes = event.getChanges();
            if (changes == null) {
                changes = Collections.emptyList();
            }
            
            // Extraer actorUserId: primero del evento, luego de la entidad (modifiedBy)
            Long actorUserId = event.getActorUserId();
            if (actorUserId == null) {
                actorUserId = extractActorUserIdFromEntity(entity);
            }
            
            AuditLogCreateDTO dto = AuditLogCreateDTO.builder()
                .companyId(extractCompanyId(entity))
                .subsidiaryId(extractSubsidiaryId(entity))
                .actorUserId(actorUserId)
                .actorUsername(extractActorUsername(actorUserId))
                .entityType(entity.getClass().getSimpleName())
                .entityId(extractEntityId(entity))
                .action(determineAction(changes))
                .changes(changes)
                .module("Administration")
                .build();
            
            auditLogClient.createAuditLog(dto, "es");
        } catch (Exception e) {
            System.err.println("Failed to create audit log: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private Long extractCompanyId(Object entity) {
        try {
            // Si la entidad es Company, usar su propio ID
            if (entity.getClass().getSimpleName().equals("Company")) {
                Method getIdMethod = entity.getClass().getMethod("getId");
                Object id = getIdMethod.invoke(entity);
                return id instanceof Long ? (Long) id : null;
            }
            
            // Intentar getCompanyId() directo
            try {
                Method method = entity.getClass().getMethod("getCompanyId");
                Object result = method.invoke(entity);
                if (result instanceof Long) {
                    return (Long) result;
                }
            } catch (NoSuchMethodException e) {
                // Continuar con siguiente método
            }
            
            // Si no, intentar getCompany().getId()
            Method method = entity.getClass().getMethod("getCompany");
            Object company = method.invoke(entity);
            if (company != null) {
                Method getIdMethod = company.getClass().getMethod("getId");
                Object id = getIdMethod.invoke(company);
                return id instanceof Long ? (Long) id : null;
            }
        } catch (Exception e) {
            // Ignorar
        }
        return null;
    }
    
    private Long extractSubsidiaryId(Object entity) {
        try {
            // Si la entidad es Subsidiary, usar su propio ID
            if (entity.getClass().getSimpleName().equals("Subsidiary")) {
                Method getIdMethod = entity.getClass().getMethod("getId");
                Object id = getIdMethod.invoke(entity);
                return id instanceof Long ? (Long) id : null;
            }
            
            // Intentar getSubsidiaryId() directo
            try {
                Method method = entity.getClass().getMethod("getSubsidiaryId");
                Object result = method.invoke(entity);
                if (result instanceof Long) {
                    return (Long) result;
                }
            } catch (NoSuchMethodException e) {
                // Continuar con siguiente método
            }
            
            // Si no, intentar getSubsidiary().getId()
            Method method = entity.getClass().getMethod("getSubsidiary");
            Object subsidiary = method.invoke(entity);
            if (subsidiary != null) {
                Method getIdMethod = subsidiary.getClass().getMethod("getId");
                Object id = getIdMethod.invoke(subsidiary);
                return id instanceof Long ? (Long) id : null;
            }
        } catch (Exception e) {
            // Ignorar
        }
        return null;
    }
    
    private Long extractEntityId(Object entity) {
        try {
            Method method = entity.getClass().getMethod("getId");
            Object result = method.invoke(entity);
            return result instanceof Long ? (Long) result : null;
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Intenta extraer el actorUserId de la entidad desde el campo modifiedBy.
     * Útil cuando el evento no tiene actorUserId (como en Company).
     */
    private Long extractActorUserIdFromEntity(Object entity) {
        try {
            Method method = entity.getClass().getMethod("getModifiedBy");
            Object modifiedBy = method.invoke(entity);
            if (modifiedBy != null) {
                Method getIdMethod = modifiedBy.getClass().getMethod("getId");
                Object id = getIdMethod.invoke(modifiedBy);
                return id instanceof Long ? (Long) id : null;
            }
        } catch (Exception e) {
            // Ignorar - no todas las entidades tienen modifiedBy
        }
        return null;
    }
    
    /**
     * Determina la acción basándose en los cambios:
     * - Si changes está vacío o es null: CREATE (nuevo registro)
     * - Si changes tiene elementos: UPDATE (modificación)
     */
    private String determineAction(List<Map<String, Object>> changes) {
        if (changes == null || changes.isEmpty()) {
            return "CREATE";
        }
        
        // Si hay cambios, es UPDATE
        return "UPDATE";
    }
    
    private String extractActorUsername(Long userId) {
        if (userId == null) {
            return null;
        }
        
        try {
            Optional<Map<String, Object>> userOpt = connectInternalApi.adminGetUser(userId, "es");
            if (userOpt.isPresent()) {
                Map<String, Object> user = userOpt.get();
                // Construir nombre completo desde name + lastName
                String first = user.get("name") != null ? user.get("name").toString() : "";
                String last = user.get("lastName") != null ? user.get("lastName").toString() : "";
                String fullName = (first + " " + last).trim();
                if (!fullName.isBlank()) {
                    return fullName;
                }
            }
        } catch (Exception e) {
            // Si falla, usar fallback
            System.err.println("Failed to get username for user " + userId + ": " + e.getMessage());
        }
        
        // Fallback: usar formato user_ID
        return "user_" + userId;
    }
}


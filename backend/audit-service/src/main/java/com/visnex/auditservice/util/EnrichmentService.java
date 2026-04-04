package com.visnex.auditservice.util;

import com.visnex.auditservice.security.ConnectInternalApi;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EnrichmentService {
    
    private final ConnectInternalApi connectInternalApi;
    
    private static final Map<Long, String> companyNameCache = new HashMap<>();
    private static final Map<Long, String> subsidiaryNameCache = new HashMap<>();
    private static final Map<Long, String> userNameCache = new HashMap<>();
    
    public String getCompanyName(Long companyId, String language) {
        if (companyId == null) return null;
        
        if (companyNameCache.containsKey(companyId)) {
            return companyNameCache.get(companyId);
        }
        
        try {
            Optional<Map<String, Object>> company = connectInternalApi.adminGetCompany(companyId, language);
            if (company.isPresent()) {
                String name = String.valueOf(company.get().getOrDefault("name", "N/A"));
                companyNameCache.put(companyId, name);
                return name;
            }
        } catch (Exception e) {
            // Silently fail
        }
        
        return null;
    }
    
    public String getSubsidiaryName(Long subsidiaryId, String language) {
        if (subsidiaryId == null) return null;
        
        if (subsidiaryNameCache.containsKey(subsidiaryId)) {
            return subsidiaryNameCache.get(subsidiaryId);
        }
        
        try {
            Optional<Map<String, Object>> subsidiary = connectInternalApi.adminGetSubsidiary(subsidiaryId, language);
            if (subsidiary.isPresent()) {
                String name = String.valueOf(subsidiary.get().getOrDefault("name", "N/A"));
                subsidiaryNameCache.put(subsidiaryId, name);
                return name;
            }
        } catch (Exception e) {
            // Silently fail
        }
        
        return null;
    }
    
    public String getUserFullName(Long userId, String language) {
        if (userId == null) return null;
        
        if (userNameCache.containsKey(userId)) {
            return userNameCache.get(userId);
        }
        
        try {
            Optional<Map<String, Object>> user = connectInternalApi.adminGetUser(userId, language);
            if (user.isPresent()) {
                String firstName = String.valueOf(user.get().getOrDefault("name", ""));
                String lastName = String.valueOf(user.get().getOrDefault("lastName", ""));
                String fullName = (firstName + " " + lastName).trim();
                if (!fullName.isBlank()) {
                    userNameCache.put(userId, fullName);
                    return fullName;
                }
            }
        } catch (Exception e) {
            // Silently fail
        }
        
        return null;
    }
    
    public String getActionDisplayName(String action, String language) {
        if (action == null) return null;
        
        Map<String, String> actionMap = Map.of(
            "CREATE", language.equals("es") ? "Creación" : "Create",
            "UPDATE", language.equals("es") ? "Actualización" : "Update",
            "DELETE", language.equals("es") ? "Eliminación" : "Delete",
            "READ", language.equals("es") ? "Consulta" : "Read",
            "EXPORT", language.equals("es") ? "Exportación" : "Export",
            "IMPORT", language.equals("es") ? "Importación" : "Import",
            "LOGIN", language.equals("es") ? "Inicio de sesión" : "Login",
            "LOGOUT", language.equals("es") ? "Cierre de sesión" : "Logout",
            "PERMISSION_CHANGE", language.equals("es") ? "Cambio de permisos" : "Permission Change"
        );
        
        return actionMap.getOrDefault(action.toUpperCase(), action);
    }
    
    public String getEntityDisplayName(String entityType, Long entityId) {
        if (entityType == null || entityId == null) return null;
        return entityType + " #" + entityId;
    }
    
    public Integer getChangesCount(String changesJson) {
        if (changesJson == null || changesJson.isBlank() || changesJson.equals("[]") || changesJson.equals("null")) {
            return 0;
        }
        try {
            // Contar objetos en el array JSON básico contando las llaves de apertura
            return (int) changesJson.chars().filter(ch -> ch == '{').count();
        } catch (Exception e) {
            return 0;
        }
    }
    
    public String getTimeAgo(LocalDateTime timestamp) {
        if (timestamp == null) return null;
        
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(timestamp, now);
        
        long seconds = duration.getSeconds();
        if (seconds < 60) {
            return seconds + " seconds ago";
        }
        
        long minutes = seconds / 60;
        if (minutes < 60) {
            return minutes + " minute" + (minutes != 1 ? "s" : "") + " ago";
        }
        
        long hours = minutes / 60;
        if (hours < 24) {
            return hours + " hour" + (hours != 1 ? "s" : "") + " ago";
        }
        
        long days = hours / 24;
        if (days < 30) {
            return days + " day" + (days != 1 ? "s" : "") + " ago";
        }
        
        long months = days / 30;
        if (months < 12) {
            return months + " month" + (months != 1 ? "s" : "") + " ago";
        }
        
        long years = days / 365;
        return years + " year" + (years != 1 ? "s" : "") + " ago";
    }
}


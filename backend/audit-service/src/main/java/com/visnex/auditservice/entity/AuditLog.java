package com.visnex.auditservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vn_audit_log", indexes = {
    @Index(name = "idx_audit_company", columnList = "company_id"),
    @Index(name = "idx_audit_subsidiary", columnList = "subsidiary_id"),
    @Index(name = "idx_audit_user", columnList = "actor_user_id"),
    @Index(name = "idx_audit_entity", columnList = "entity_type,entity_id"),
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_module", columnList = "module")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Contexto multi-tenant
    @Column(name = "company_id", nullable = false)
    private Long companyId;
    
    @Column(name = "subsidiary_id")
    private Long subsidiaryId;
    
    // Actor (quién hizo el cambio)
    @Column(name = "actor_user_id", nullable = false)
    private Long actorUserId;
    
    @Column(name = "actor_username", length = 100)
    private String actorUsername;
    
    // Entidad afectada
    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;
    
    @Column(name = "entity_id", nullable = false)
    private Long entityId;
    
    // Acción realizada
    @Column(name = "action", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private Action action;
    
    public enum Action {
        CREATE,
        UPDATE,
        DELETE,
        READ,
        EXPORT,
        IMPORT,
        LOGIN,
        LOGOUT,
        PERMISSION_CHANGE
    }
    
    // Cambios detallados (JSON estructurado)
    @Column(name = "changes", columnDefinition = "TEXT")
    private String changes;
    
    // Módulo del sistema
    @Column(name = "module", nullable = false, length = 80)
    private String module;
    
    // Timestamp único (inmutable)
    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;
}


package com.visnex.auditservice.entity;

/**
 * @deprecated Use AuditLog.Action instead
 */
@Deprecated
public enum AuditAction {
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


package com.visnex.auditservice.repository;

import com.visnex.auditservice.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    @Query("SELECT COUNT(a) FROM AuditLog a")
    long countAll();
    
    @Modifying
    @Query(value = "DELETE FROM hq_audit_log WHERE id IN " +
           "(SELECT id FROM hq_audit_log ORDER BY timestamp ASC LIMIT :batchSize)", 
           nativeQuery = true)
    int deleteOldestBatch(@Param("batchSize") int batchSize);
    
    @Query("SELECT MIN(a.timestamp) FROM AuditLog a")
    LocalDateTime findOldestTimestamp();
    
    Page<AuditLog> findByCompanyIdAndSubsidiaryId(Long companyId, Long subsidiaryId, Pageable pageable);
}


package com.visnex.auditservice.repository.implementation;

import com.visnex.auditservice.dto.input.AuditLogFilterDTO;
import com.visnex.auditservice.dto.output.ResultAuditLogDTO;
import com.visnex.auditservice.entity.AuditLog;
import com.visnex.auditservice.mapper.AuditLogMapper;
import com.visnex.auditservice.repository.CustomAuditLogRepository;
import com.visnex.auditservice.util.PredicateBuilderUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomAuditLogRepositoryImpl implements CustomAuditLogRepository {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    private final AuditLogMapper auditLogMapper;
    
    @Override
    public Page<ResultAuditLogDTO> findAllWithCriteria(AuditLogFilterDTO filterDTO, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        
        // Query principal
        CriteriaQuery<AuditLog> cq = cb.createQuery(AuditLog.class);
        Root<AuditLog> root = cq.from(AuditLog.class);
        
        List<Predicate> predicates = buildPredicates(cb, root, filterDTO);
        
        cq.select(root)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .orderBy(cb.desc(root.get("timestamp")));
        
        TypedQuery<AuditLog> typedQuery = entityManager.createQuery(cq);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());
        List<AuditLog> entities = typedQuery.getResultList();
        
        // Count query
        CriteriaQuery<Long> countCq = cb.createQuery(Long.class);
        Root<AuditLog> countRoot = countCq.from(AuditLog.class);
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, filterDTO);
        countCq.select(cb.count(countRoot))
                .where(cb.and(countPredicates.toArray(new Predicate[0])));
        Long total = entityManager.createQuery(countCq).getSingleResult();
        
        // Mapeo a DTO
        List<ResultAuditLogDTO> content = entities.stream()
                .map(auditLogMapper::toDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(content, pageable, total);
    }
    
    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<AuditLog> root, AuditLogFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();
        
        // IDs
        PredicateBuilderUtil.addEquals(predicates, cb, root, "id", filter.getId());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "companyId", filter.getCompanyId());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "subsidiaryId", filter.getSubsidiaryId());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "actorUserId", filter.getActorUserId());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "entityId", filter.getEntityId());
        
        // Strings con LIKE
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "entityType", filter.getEntityType());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "module", filter.getModule());
        
        // Action exacto
        if (filter.getAction() != null && !filter.getAction().trim().isEmpty()) {
            predicates.add(cb.equal(root.get("action"), filter.getAction().toUpperCase()));
        }
        
        // Rango de fechas
        PredicateBuilderUtil.addDateRange(predicates, cb, root, "timestamp", filter.getStartDate(), filter.getEndDate());
        
        return predicates;
    }
}


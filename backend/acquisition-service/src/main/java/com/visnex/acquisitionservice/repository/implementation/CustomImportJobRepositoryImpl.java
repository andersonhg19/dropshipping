package com.visnex.acquisitionservice.repository.implementation;

import com.visnex.acquisitionservice.dto.input.ImportJobFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultImportJobDTO;
import com.visnex.acquisitionservice.entity.ImportJob;
import com.visnex.acquisitionservice.mapper.ImportJobMapper;
import com.visnex.acquisitionservice.repository.CustomImportJobRepository;
import com.visnex.acquisitionservice.util.PredicateBuilderUtil;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomImportJobRepositoryImpl implements CustomImportJobRepository {

    @PersistenceContext
    private EntityManager entityManager;

    private final ImportJobMapper mapper;

    @Override
    public Page<ResultImportJobDTO> findAllWithCriteria(ImportJobFilterDTO filter, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<ImportJob> query = cb.createQuery(ImportJob.class);
        Root<ImportJob> root = query.from(ImportJob.class);
        List<Predicate> predicates = buildPredicates(cb, root, filter);

        query.select(root)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .orderBy(cb.desc(root.get("creation")));

        TypedQuery<ImportJob> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<ImportJob> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<ImportJob> countRoot = countQuery.from(ImportJob.class);
        countQuery.select(cb.count(countRoot))
                .where(cb.and(buildPredicates(cb, countRoot, filter).toArray(new Predicate[0])));

        long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ResultImportJobDTO> dtos = results.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<ImportJob> root, ImportJobFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        PredicateBuilderUtil.addEquals(predicates, cb, root, "id", filter.getId());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "companyId", filter.getIdCompany());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "subsidiaryId", filter.getIdSubsidiary());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "idModifiedBy", filter.getIdModifiedBy());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "fileName", filter.getFileName());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "fileType", filter.getFileType());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "status", filter.getStatus());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "idSupplier", filter.getIdSupplier());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "active", filter.getActive());

        if (filter.getStartDate() != null || filter.getEndDate() != null) {
            LocalDateTime start = (filter.getStartDate() != null) ? filter.getStartDate() : LocalDateTime.of(1970, 1, 1, 0, 0);
            LocalDateTime end = (filter.getEndDate() != null) ? filter.getEndDate() : LocalDateTime.of(9999, 12, 31, 23, 59, 59, 999_000_000);
            PredicateBuilderUtil.addDateRange(predicates, cb, root, "creation", start, end);
        }

        return predicates;
    }
}

package com.visnex.acquisitionservice.repository.implementation;

import com.visnex.acquisitionservice.dto.input.ImportTemplateFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultImportTemplateDTO;
import com.visnex.acquisitionservice.entity.ImportTemplate;
import com.visnex.acquisitionservice.mapper.ImportTemplateMapper;
import com.visnex.acquisitionservice.repository.CustomImportTemplateRepository;
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
public class CustomImportTemplateRepositoryImpl implements CustomImportTemplateRepository {

    @PersistenceContext
    private EntityManager entityManager;

    private final ImportTemplateMapper mapper;

    @Override
    public Page<ResultImportTemplateDTO> findAllWithCriteria(ImportTemplateFilterDTO filter, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<ImportTemplate> query = cb.createQuery(ImportTemplate.class);
        Root<ImportTemplate> root = query.from(ImportTemplate.class);
        List<Predicate> predicates = buildPredicates(cb, root, filter);

        query.select(root)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .orderBy(cb.asc(root.get("name")));

        TypedQuery<ImportTemplate> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<ImportTemplate> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<ImportTemplate> countRoot = countQuery.from(ImportTemplate.class);
        countQuery.select(cb.count(countRoot))
                .where(cb.and(buildPredicates(cb, countRoot, filter).toArray(new Predicate[0])));

        long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ResultImportTemplateDTO> dtos = results.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<ImportTemplate> root, ImportTemplateFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        PredicateBuilderUtil.addEquals(predicates, cb, root, "id", filter.getId());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "companyId", filter.getIdCompany());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "subsidiaryId", filter.getIdSubsidiary());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "idModifiedBy", filter.getIdModifiedBy());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "name", filter.getName());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "fileType", filter.getFileType());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "active", filter.getActive());

        if (filter.getStartDate() != null || filter.getEndDate() != null) {
            LocalDateTime start = (filter.getStartDate() != null) ? filter.getStartDate() : LocalDateTime.of(1970, 1, 1, 0, 0);
            LocalDateTime end = (filter.getEndDate() != null) ? filter.getEndDate() : LocalDateTime.of(9999, 12, 31, 23, 59, 59, 999_000_000);
            PredicateBuilderUtil.addDateRange(predicates, cb, root, "creation", start, end);
        }

        return predicates;
    }
}

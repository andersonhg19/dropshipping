package com.visnex.acquisitionservice.repository.implementation;

import com.visnex.acquisitionservice.dto.input.SourceProductFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultSourceProductDTO;
import com.visnex.acquisitionservice.entity.SourceProduct;
import com.visnex.acquisitionservice.mapper.SourceProductMapper;
import com.visnex.acquisitionservice.repository.CustomSourceProductRepository;
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
public class CustomSourceProductRepositoryImpl implements CustomSourceProductRepository {

    @PersistenceContext
    private EntityManager entityManager;

    private final SourceProductMapper mapper;

    @Override
    public Page<ResultSourceProductDTO> findAllWithCriteria(SourceProductFilterDTO filter, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<SourceProduct> query = cb.createQuery(SourceProduct.class);
        Root<SourceProduct> root = query.from(SourceProduct.class);
        List<Predicate> predicates = buildPredicates(cb, root, filter);

        query.select(root)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .orderBy(cb.desc(root.get("creation")));

        TypedQuery<SourceProduct> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<SourceProduct> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<SourceProduct> countRoot = countQuery.from(SourceProduct.class);
        countQuery.select(cb.count(countRoot))
                .where(cb.and(buildPredicates(cb, countRoot, filter).toArray(new Predicate[0])));

        long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ResultSourceProductDTO> dtos = results.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<SourceProduct> root, SourceProductFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        PredicateBuilderUtil.addEquals(predicates, cb, root, "id", filter.getId());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "companyId", filter.getIdCompany());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "subsidiaryId", filter.getIdSubsidiary());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "idModifiedBy", filter.getIdModifiedBy());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "sourceProvider", filter.getSourceProvider());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "sourceId", filter.getSourceId());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "title", filter.getTitle());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "category", filter.getCategory());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "supplierName", filter.getSupplierName());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "imported", filter.getImported());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "active", filter.getActive());

        if (filter.getStartDate() != null || filter.getEndDate() != null) {
            LocalDateTime start = (filter.getStartDate() != null) ? filter.getStartDate() : LocalDateTime.of(1970, 1, 1, 0, 0);
            LocalDateTime end = (filter.getEndDate() != null) ? filter.getEndDate() : LocalDateTime.of(9999, 12, 31, 23, 59, 59, 999_000_000);
            PredicateBuilderUtil.addDateRange(predicates, cb, root, "creation", start, end);
        }

        return predicates;
    }
}

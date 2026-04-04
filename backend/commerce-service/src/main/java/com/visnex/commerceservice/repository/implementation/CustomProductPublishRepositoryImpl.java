package com.visnex.commerceservice.repository.implementation;

import com.visnex.commerceservice.dto.input.ProductPublishFilterDTO;
import com.visnex.commerceservice.entity.ProductPublish;
import com.visnex.commerceservice.repository.CustomProductPublishRepository;
import com.visnex.commerceservice.util.PredicateBuilderUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
@Transactional(readOnly = true)
public class CustomProductPublishRepositoryImpl implements CustomProductPublishRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<ProductPublish> findAllWithCriteria(ProductPublishFilterDTO filter, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<ProductPublish> query = cb.createQuery(ProductPublish.class);
        Root<ProductPublish> root = query.from(ProductPublish.class);
        List<Predicate> predicates = buildPredicates(cb, root, filter);

        query.select(root)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .orderBy(cb.desc(root.get("creation")));

        TypedQuery<ProductPublish> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<ProductPublish> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<ProductPublish> countRoot = countQuery.from(ProductPublish.class);
        countQuery.select(cb.count(countRoot))
                .where(cb.and(buildPredicates(cb, countRoot, filter).toArray(new Predicate[0])));

        long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(results, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<ProductPublish> root, ProductPublishFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        PredicateBuilderUtil.addEquals(predicates, cb, root, "id", filter.getId());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "companyId", filter.getIdCompany());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "subsidiaryId", filter.getIdSubsidiary());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "idModifiedBy", filter.getIdModifiedBy());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "idProduct", filter.getIdProduct());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "idChannel", filter.getIdChannel());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "syncStatus", filter.getSyncStatus());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "active", filter.getActive());

        if (filter.getStartDate() != null || filter.getEndDate() != null) {
            LocalDateTime start = (filter.getStartDate() != null) ? filter.getStartDate() : LocalDateTime.of(1970, 1, 1, 0, 0);
            LocalDateTime end = (filter.getEndDate() != null) ? filter.getEndDate() : LocalDateTime.of(9999, 12, 31, 23, 59, 59, 999_000_000);
            PredicateBuilderUtil.addDateRange(predicates, cb, root, "creation", start, end);
        }

        return predicates;
    }
}

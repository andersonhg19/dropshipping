package com.visnex.administrationservice.repository.implementation;

import com.visnex.administrationservice.dto.input.StyleFilterDTO;
import com.visnex.administrationservice.dto.output.ResultStyleDTO;
import com.visnex.administrationservice.entity.Style;
import com.visnex.administrationservice.mapper.StyleMapper;
import com.visnex.administrationservice.repository.CustomStyleRepository;
import com.visnex.administrationservice.util.PredicateBuilderUtil;
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
public class CustomStyleRepositoryImpl implements CustomStyleRepository {

    @PersistenceContext
    private EntityManager entityManager;

    private final StyleMapper styleMapper;

    @Override
    public Page<ResultStyleDTO> findAllWithCriteria(StyleFilterDTO filter, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<Style> query = cb.createQuery(Style.class);
        Root<Style> root = query.from(Style.class);
        List<Predicate> predicates = buildPredicates(cb, root, filter);

        query.select(root)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .orderBy(cb.asc(root.get("type")), cb.asc(root.get("name")));

        TypedQuery<Style> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Style> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Style> countRoot = countQuery.from(Style.class);
        countQuery.select(cb.count(countRoot))
                .where(cb.and(buildPredicates(cb, countRoot, filter).toArray(new Predicate[0])));

        long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ResultStyleDTO> dtos = results.stream()
                .map(styleMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Style> root, StyleFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        PredicateBuilderUtil.addEquals(predicates, cb, root, "id", filter.getId());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "company", "id", filter.getIdCompany());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "subsidiary", "id", filter.getIdSubsidiary());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "modifiedBy", "id", filter.getIdModifiedBy());

        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "name", filter.getName());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "value", filter.getValue());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "type", filter.getType());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "typeValue", filter.getTypeValue());

        PredicateBuilderUtil.addEquals(predicates, cb, root, "active", filter.getActive());

        if (filter.getStartDate() != null || filter.getEndDate() != null) {
            LocalDateTime start = (filter.getStartDate() != null)
                    ? filter.getStartDate()
                    : LocalDateTime.of(1970, 1, 1, 0, 0);
            LocalDateTime end = (filter.getEndDate() != null)
                    ? filter.getEndDate()
                    : LocalDateTime.of(9999, 12, 31, 23, 59, 59, 999_000_000);

            PredicateBuilderUtil.addDateRange(predicates, cb, root, "creation", start, end);
        }


        return predicates;
    }
}

package com.visnex.administrationservice.repository.implementation;

import com.visnex.administrationservice.dto.input.ConfigurationFilterDTO;
import com.visnex.administrationservice.dto.output.ResultConfigurationDTO;
import com.visnex.administrationservice.entity.Configuration;
import com.visnex.administrationservice.mapper.ConfigurationMapper;
import com.visnex.administrationservice.repository.CustomConfigurationRepository;
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
public class CustomConfigurationRepositoryImpl implements CustomConfigurationRepository {

    @PersistenceContext
    private EntityManager entityManager;

    private final ConfigurationMapper configurationMapper;

    @Override
    public Page<ResultConfigurationDTO> findAllWithCriteria(ConfigurationFilterDTO filter, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<Configuration> query = cb.createQuery(Configuration.class);
        Root<Configuration> root = query.from(Configuration.class);
        List<Predicate> predicates = buildPredicates(cb, root, filter);

        query.select(root)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .orderBy(cb.asc(root.get("type")), cb.asc(root.get("name")));

        TypedQuery<Configuration> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Configuration> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Configuration> countRoot = countQuery.from(Configuration.class);
        countQuery.select(cb.count(countRoot))
                .where(cb.and(buildPredicates(cb, countRoot, filter).toArray(new Predicate[0])));

        long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ResultConfigurationDTO> dtos = results.stream()
                .map(configurationMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Configuration> root, ConfigurationFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        PredicateBuilderUtil.addEquals(predicates, cb, root, "id", filter.getId());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "company", "id", filter.getIdCompany());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "subsidiary", "id", filter.getIdSubsidiary());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "modifiedBy", "id", filter.getIdModifiedBy());

        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "type", filter.getType());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "name", filter.getName());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "value", filter.getValue());

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

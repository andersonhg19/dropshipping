package com.visnex.administrationservice.repository.implementation;

import com.visnex.administrationservice.dto.input.MailServerConfigurationFilterDTO;
import com.visnex.administrationservice.dto.output.ResultMailServerConfigurationDTO;
import com.visnex.administrationservice.entity.MailServerConfiguration;
import com.visnex.administrationservice.mapper.MailServerConfigurationMapper;
import com.visnex.administrationservice.repository.CustomMailServerConfigurationRepository;
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
public class CustomMailServerConfigurationRepositoryImpl implements CustomMailServerConfigurationRepository {

    @PersistenceContext
    private EntityManager entityManager;

    private final MailServerConfigurationMapper mapper;

    @Override
    public Page<ResultMailServerConfigurationDTO> findAllWithCriteria(MailServerConfigurationFilterDTO filter, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<MailServerConfiguration> query = cb.createQuery(MailServerConfiguration.class);
        Root<MailServerConfiguration> root = query.from(MailServerConfiguration.class);
        List<Predicate> predicates = buildPredicates(cb, root, filter);

        query.select(root)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .orderBy(cb.asc(root.get("name")));

        TypedQuery<MailServerConfiguration> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<MailServerConfiguration> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<MailServerConfiguration> countRoot = countQuery.from(MailServerConfiguration.class);
        countQuery.select(cb.count(countRoot))
                .where(cb.and(buildPredicates(cb, countRoot, filter).toArray(new Predicate[0])));

        long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ResultMailServerConfigurationDTO> dtos = results.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<MailServerConfiguration> root, MailServerConfigurationFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        PredicateBuilderUtil.addEquals(predicates, cb, root, "id", filter.getId());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "company", "id", filter.getIdCompany());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "subsidiary", "id", filter.getIdSubsidiary());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "modifiedBy", "id", filter.getIdModifiedBy());

        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "name", filter.getName());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "host", filter.getHost());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "port", filter.getPort());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "username", filter.getUsername());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "alias", filter.getAlias());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "protocol", filter.getProtocol());

        PredicateBuilderUtil.addEquals(predicates, cb, root, "auth", filter.getAuth());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "enable", filter.getEnable());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "active", filter.getActive());

        LocalDateTime now = LocalDateTime.now();

        LocalDateTime start = filter.getStartDate() != null
                ? filter.getStartDate()
                : now.withHour(0).withMinute(0).withSecond(0).withNano(0);

        LocalDateTime end = filter.getEndDate() != null
                ? filter.getEndDate()
                : now.withHour(23).withMinute(59).withSecond(59).withNano(999_999_999);

        PredicateBuilderUtil.addDateRange(predicates, cb, root, "creation", start, end);

        return predicates;
    }
}

package com.visnex.administrationservice.repository.implementation;

import com.visnex.administrationservice.dto.input.PageTypeUserFilterDTO;
import com.visnex.administrationservice.dto.output.ResultPageTypeUserDTO;
import com.visnex.administrationservice.entity.PageTypeUser;
import com.visnex.administrationservice.mapper.PageTypeUserMapper;
import com.visnex.administrationservice.repository.CustomPageTypeUserRepository;
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
public class CustomPageTypeUserRepositoryImpl implements CustomPageTypeUserRepository {

    @PersistenceContext
    private EntityManager entityManager;

    private final PageTypeUserMapper pageTypeUserMapper;

    @Override
    public Page<ResultPageTypeUserDTO> findAllWithCriteria(PageTypeUserFilterDTO filter, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<PageTypeUser> query = cb.createQuery(PageTypeUser.class);
        Root<PageTypeUser> root = query.from(PageTypeUser.class);
        List<Predicate> predicates = buildPredicates(cb, root, filter);

        query.select(root)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .orderBy(cb.asc(root.get("creation")));

        TypedQuery<PageTypeUser> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<PageTypeUser> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<PageTypeUser> countRoot = countQuery.from(PageTypeUser.class);
        countQuery.select(cb.count(countRoot))
                .where(cb.and(buildPredicates(cb, countRoot, filter).toArray(new Predicate[0])));

        long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ResultPageTypeUserDTO> dtos = results.stream()
                .map(pageTypeUserMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<PageTypeUser> root, PageTypeUserFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        PredicateBuilderUtil.addEquals(predicates, cb, root, "id", filter.getId());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "page", "id", filter.getIdPage());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "typeUser", "id", filter.getIdTypeUser());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "modifiedBy", "id", filter.getIdModifiedBy());

        PredicateBuilderUtil.addEquals(predicates, cb, root, "canCreate", filter.getCanCreate());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "canUpdate", filter.getCanUpdate());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "canRead", filter.getCanRead());
        PredicateBuilderUtil.addEquals(predicates, cb, root, "canDelete", filter.getCanDelete());
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

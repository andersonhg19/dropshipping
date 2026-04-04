package com.visnex.administrationservice.repository.implementation;

import com.visnex.administrationservice.dto.input.ModuleFilterDTO;
import com.visnex.administrationservice.dto.output.ResultModuleDTO;
import com.visnex.administrationservice.entity.Module;
import com.visnex.administrationservice.mapper.ModuleMapper;
import com.visnex.administrationservice.repository.CustomModuleRepository;
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
public class CustomModuleRepositoryImpl implements CustomModuleRepository {

    @PersistenceContext
    private EntityManager entityManager;

    private final ModuleMapper moduleMapper;

    @Override
    public Page<ResultModuleDTO> findAllWithCriteria(ModuleFilterDTO filter, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<Module> query = cb.createQuery(Module.class);
        Root<Module> root = query.from(Module.class);
        List<Predicate> predicates = buildPredicates(cb, root, filter);

        query.select(root)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .orderBy(cb.asc(root.get("name")));

        TypedQuery<Module> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Module> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Module> countRoot = countQuery.from(Module.class);
        countQuery.select(cb.count(countRoot))
                .where(cb.and(buildPredicates(cb, countRoot, filter).toArray(new Predicate[0])));

        long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ResultModuleDTO> dtos = results.stream()
                .map(moduleMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Module> root, ModuleFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        PredicateBuilderUtil.addEquals(predicates, cb, root, "id", filter.getId());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "modifiedBy", "id", filter.getIdModifiedBy());

        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "name", filter.getName());
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

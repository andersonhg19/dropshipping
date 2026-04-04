package com.visnex.administrationservice.repository.implementation;

import com.visnex.administrationservice.dto.input.UserFilterDTO;
import com.visnex.administrationservice.dto.output.ResultUserDTO;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.mapper.UserMapper;
import com.visnex.administrationservice.repository.CustomUserRepository;
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
public class CustomUserRepositoryImpl implements CustomUserRepository {

    @PersistenceContext
    private EntityManager entityManager;

    private final UserMapper userMapper;

    @Override
    public Page<ResultUserDTO> findAllWithCriteria(UserFilterDTO filter, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<User> query = cb.createQuery(User.class);
        Root<User> root = query.from(User.class);
        List<Predicate> predicates = buildPredicates(cb, root, filter);

        query.select(root)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .orderBy(cb.asc(root.get("name")));

        TypedQuery<User> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<User> users = typedQuery.getResultList();
        users.forEach(u -> u.setPassword("")); // clear sensitive data

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<User> countRoot = countQuery.from(User.class);
        countQuery.select(cb.count(countRoot))
                .where(cb.and(buildPredicates(cb, countRoot, filter).toArray(new Predicate[0])));

        long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ResultUserDTO> dtos = users.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<User> root, UserFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        PredicateBuilderUtil.addEquals(predicates, cb, root, "id", filter.getId());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "company", "id", filter.getIdCompany());
        PredicateBuilderUtil.addLeftJoinEquals(predicates, cb, root, "subsidiary", "id", filter.getIdSubsidiary());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "modifiedBy", "id", filter.getIdModifiedBy());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "typeUser", "id", filter.getIdTypeUser());

        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "name", filter.getName());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "lastName", filter.getLastName());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "email", filter.getEmail());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "dni", filter.getDni());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "cellphone", filter.getCellphone());

        PredicateBuilderUtil.addEquals(predicates, cb, root, "admin", filter.getAdmin());
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

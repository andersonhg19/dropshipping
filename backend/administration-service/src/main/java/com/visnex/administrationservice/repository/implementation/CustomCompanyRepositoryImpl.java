package com.visnex.administrationservice.repository.implementation;

import com.visnex.administrationservice.dto.input.CompanyFilterDTO;
import com.visnex.administrationservice.dto.output.ResultCompanyDTO;
import com.visnex.administrationservice.entity.Company;
import com.visnex.administrationservice.mapper.CompanyMapper;
import com.visnex.administrationservice.repository.CustomCompanyRepository;
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
public class CustomCompanyRepositoryImpl implements CustomCompanyRepository {

    @PersistenceContext
    private EntityManager entityManager;

    private final CompanyMapper companyMapper;

    @Override
    public Page<ResultCompanyDTO> findAllWithCriteria(CompanyFilterDTO filter, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<Company> query = cb.createQuery(Company.class);
        Root<Company> root = query.from(Company.class);
        List<Predicate> predicates = buildPredicates(cb, root, filter);

        query.select(root)
                .where(cb.and(predicates.toArray(new Predicate[0])))
                .orderBy(cb.asc(root.get("name")));

        TypedQuery<Company> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Company> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Company> countRoot = countQuery.from(Company.class);
        countQuery.select(cb.count(countRoot))
                .where(cb.and(buildPredicates(cb, countRoot, filter).toArray(new Predicate[0])));

        long total = entityManager.createQuery(countQuery).getSingleResult();

        List<ResultCompanyDTO> dtos = results.stream()
                .map(companyMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Company> root, CompanyFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        PredicateBuilderUtil.addEquals(predicates, cb, root, "id", filter.getId());
        PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "modifiedBy", "id", filter.getIdModifiedBy());

        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "name", filter.getName());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "nit", filter.getNit());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "address", filter.getAddress());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "legalRepresentative", filter.getLegalRepresentative());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "email", filter.getEmail());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "phone", filter.getPhone());
        PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "image", filter.getImage());

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

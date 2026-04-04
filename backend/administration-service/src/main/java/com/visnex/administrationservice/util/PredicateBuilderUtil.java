package com.visnex.administrationservice.util;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.time.LocalDateTime;
import java.util.List;

public class PredicateBuilderUtil {

    public static <T> void addEquals(List<Predicate> predicates, CriteriaBuilder cb, Root<T> root, String fieldName, Object value) {
        if (value != null) {
            predicates.add(cb.equal(root.get(fieldName), value));
        }
    }

    public static <T> void addLikeIgnoreCase(List<Predicate> predicates, CriteriaBuilder cb, Root<T> root, String fieldName, String value) {
        if (value != null && !value.isBlank()) {
            predicates.add(cb.like(cb.lower(root.get(fieldName)), "%" + value.trim().toLowerCase() + "%"));
        }
    }

    public static <T, J> void addJoinEquals(List<Predicate> predicates, CriteriaBuilder cb, Root<T> root, String joinName, String joinField, Object value) {
        if (value != null) {
            predicates.add(cb.equal(root.join(joinName).get(joinField), value));
        }
    }

    public static <T, J> void addLeftJoinEquals(List<Predicate> predicates, CriteriaBuilder cb, Root<T> root, String joinName, String joinField, Object value) {
        if (value != null) {
            predicates.add(cb.equal(root.join(joinName, jakarta.persistence.criteria.JoinType.LEFT).get(joinField), value));
        }
    }

    public static <T> void addDateRange(List<Predicate> predicates, CriteriaBuilder cb, Root<T> root, String fieldName, LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null) {
            predicates.add(cb.between(root.get(fieldName), start, end));
        } else if (start != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get(fieldName), start));
        } else if (end != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get(fieldName), end));
        }
    }
}

package com.visnex.auditservice.util;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

public class PredicateBuilderUtil {

    private static boolean isUsable(Object value) {
        if (value == null) return false;

        if (value instanceof String s) {
            return !s.isBlank();
        }

        if (value instanceof Byte b)    return b > 0;
        if (value instanceof Short s)   return s > 0;
        if (value instanceof Integer i) return i > 0;
        if (value instanceof Long l)    return l > 0L;

        return true;
    }

    public static <T> void addEquals(List<Predicate> predicates, CriteriaBuilder cb, Root<T> root, String fieldName, Object value) {
        if (isUsable(value)) {
            predicates.add(cb.equal(root.get(fieldName), value));
        }
    }

    public static <T> void addLikeIgnoreCase(List<Predicate> predicates, CriteriaBuilder cb, Root<T> root, String fieldName, String value) {
        if (value != null && !value.isBlank()) {
            predicates.add(cb.like(cb.lower(root.get(fieldName)), "%" + value.trim().toLowerCase() + "%"));
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


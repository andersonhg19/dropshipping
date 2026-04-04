package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, CustomCategoryRepository {
    Optional<Category> findFirstByNameAndCompanyIdAndActive(String name, Long companyId, Boolean active);
}

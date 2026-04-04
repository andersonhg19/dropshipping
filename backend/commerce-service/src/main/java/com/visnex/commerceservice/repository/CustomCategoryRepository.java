package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.dto.input.CategoryFilterDTO;
import com.visnex.commerceservice.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomCategoryRepository {
    Page<Category> findAllWithCriteria(CategoryFilterDTO filterDTO, Pageable pageable);
}

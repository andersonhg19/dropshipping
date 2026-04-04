package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.dto.input.ProductImageFilterDTO;
import com.visnex.commerceservice.entity.ProductImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomProductImageRepository {
    Page<ProductImage> findAllWithCriteria(ProductImageFilterDTO filterDTO, Pageable pageable);
}

package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.dto.input.ProductFilterDTO;
import com.visnex.commerceservice.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomProductRepository {
    Page<Product> findAllWithCriteria(ProductFilterDTO filterDTO, Pageable pageable);
}

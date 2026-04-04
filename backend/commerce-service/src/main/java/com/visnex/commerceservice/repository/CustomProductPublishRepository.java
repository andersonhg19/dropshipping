package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.dto.input.ProductPublishFilterDTO;
import com.visnex.commerceservice.entity.ProductPublish;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomProductPublishRepository {
    Page<ProductPublish> findAllWithCriteria(ProductPublishFilterDTO filterDTO, Pageable pageable);
}

package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.dto.input.PromotionFilterDTO;
import com.visnex.commerceservice.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomPromotionRepository {
    Page<Promotion> findAllWithCriteria(PromotionFilterDTO filterDTO, Pageable pageable);
}

package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.dto.input.PricingConfigFilterDTO;
import com.visnex.commerceservice.entity.PricingConfig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomPricingConfigRepository {
    Page<PricingConfig> findAllWithCriteria(PricingConfigFilterDTO filterDTO, Pageable pageable);
}

package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.dto.input.EnrichmentConfigFilterDTO;
import com.visnex.commerceservice.entity.EnrichmentConfig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomEnrichmentConfigRepository {
    Page<EnrichmentConfig> findAllWithCriteria(EnrichmentConfigFilterDTO filterDTO, Pageable pageable);
}

package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.entity.EnrichmentConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrichmentConfigRepository extends JpaRepository<EnrichmentConfig, Long>, CustomEnrichmentConfigRepository {
}

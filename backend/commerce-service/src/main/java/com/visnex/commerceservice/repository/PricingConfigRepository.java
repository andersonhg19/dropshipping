package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.entity.PricingConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PricingConfigRepository extends JpaRepository<PricingConfig, Long>, CustomPricingConfigRepository {
}

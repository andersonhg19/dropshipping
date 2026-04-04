package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long>, CustomPromotionRepository {
    Optional<Promotion> findFirstByNameAndCompanyIdAndActive(String name, Long companyId, Boolean active);
}

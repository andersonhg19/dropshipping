package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, CustomProductRepository {
    Optional<Product> findFirstByTitleAndCompanyIdAndActive(String title, Long companyId, Boolean active);
}

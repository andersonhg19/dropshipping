package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long>, CustomProductImageRepository {
}

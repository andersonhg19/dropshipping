package com.visnex.acquisitionservice.repository;

import com.visnex.acquisitionservice.entity.SourceProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SourceProductRepository extends JpaRepository<SourceProduct, Long>, CustomSourceProductRepository {
}

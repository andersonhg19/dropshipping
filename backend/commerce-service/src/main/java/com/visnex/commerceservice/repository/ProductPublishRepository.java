package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.entity.ProductPublish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductPublishRepository extends JpaRepository<ProductPublish, Long>, CustomProductPublishRepository {
    Optional<ProductPublish> findFirstByIdProductAndIdChannelAndActive(Long idProduct, Long idChannel, Boolean active);
}

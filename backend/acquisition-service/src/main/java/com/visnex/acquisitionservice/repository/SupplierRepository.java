package com.visnex.acquisitionservice.repository;

import com.visnex.acquisitionservice.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long>, CustomSupplierRepository {
    Optional<Supplier> findFirstByNameAndCompanyIdAndActive(String name, Long companyId, Boolean active);
}

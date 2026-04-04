package com.visnex.acquisitionservice.repository;

import com.visnex.acquisitionservice.entity.SourceConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SourceConfigRepository extends JpaRepository<SourceConfig, Long>, CustomSourceConfigRepository {
    Optional<SourceConfig> findFirstByNameAndCompanyIdAndActive(String name, Long companyId, Boolean active);
}

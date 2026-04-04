package com.visnex.acquisitionservice.repository;

import com.visnex.acquisitionservice.entity.ImportTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ImportTemplateRepository extends JpaRepository<ImportTemplate, Long>, CustomImportTemplateRepository {
    Optional<ImportTemplate> findFirstByNameAndCompanyIdAndActive(String name, Long companyId, Boolean active);
}

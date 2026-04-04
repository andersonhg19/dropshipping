package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.entity.PromptTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromptTemplateRepository extends JpaRepository<PromptTemplate, Long>, CustomPromptTemplateRepository {
    Optional<PromptTemplate> findFirstByNameAndCompanyIdAndActive(String name, Long companyId, Boolean active);
}

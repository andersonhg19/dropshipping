package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.entity.Configuration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfigurationRepository
        extends JpaRepository<Configuration, Long>, CustomConfigurationRepository {

    Optional<Configuration> findByCompany_IdAndSubsidiary_IdAndNameIgnoreCase(Long idCompany, Long idSubsidiary, String name);
    Optional<Configuration> findByCompany_IdAndNameIgnoreCaseAndSubsidiaryIsNull(Long idCompany, String name);
}

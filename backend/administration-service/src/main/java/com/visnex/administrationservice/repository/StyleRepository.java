package com.visnex.administrationservice.repository;


import com.visnex.administrationservice.entity.Style;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StyleRepository
        extends JpaRepository<Style, Long>, CustomStyleRepository {

    Optional<Style> findByCompany_IdAndSubsidiary_IdAndNameIgnoreCase(Long idCompany, Long idSubsidiary, String name);
    Optional<Style> findByCompany_IdAndNameIgnoreCaseAndSubsidiaryIsNull(Long idCompany, String name);
}
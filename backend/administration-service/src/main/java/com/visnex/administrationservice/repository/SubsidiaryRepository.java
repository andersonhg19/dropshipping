package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.entity.Subsidiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubsidiaryRepository extends JpaRepository<Subsidiary, Long>, CustomSubsidiaryRepository {
}
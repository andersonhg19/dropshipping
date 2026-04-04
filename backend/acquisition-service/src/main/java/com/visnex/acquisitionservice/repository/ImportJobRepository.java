package com.visnex.acquisitionservice.repository;

import com.visnex.acquisitionservice.entity.ImportJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImportJobRepository extends JpaRepository<ImportJob, Long>, CustomImportJobRepository {
}

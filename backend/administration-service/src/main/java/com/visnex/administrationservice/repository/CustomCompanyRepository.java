package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.dto.input.CompanyFilterDTO;
import com.visnex.administrationservice.dto.output.ResultCompanyDTO;
import com.visnex.administrationservice.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomCompanyRepository {
    Page<ResultCompanyDTO> findAllWithCriteria(CompanyFilterDTO filterDTO, Pageable pageable);
}
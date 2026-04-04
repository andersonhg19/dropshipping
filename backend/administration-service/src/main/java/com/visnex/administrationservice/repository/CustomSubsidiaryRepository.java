package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.dto.input.SubsidiaryFilterDTO;
import com.visnex.administrationservice.dto.output.ResultSubsidiaryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomSubsidiaryRepository {
    Page<ResultSubsidiaryDTO> findAllWithCriteria(SubsidiaryFilterDTO filterDTO, Pageable pageable);
}
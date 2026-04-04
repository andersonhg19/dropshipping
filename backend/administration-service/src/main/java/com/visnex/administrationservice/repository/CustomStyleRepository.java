package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.dto.input.StyleFilterDTO;
import com.visnex.administrationservice.dto.output.ResultStyleDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomStyleRepository {
    Page<ResultStyleDTO> findAllWithCriteria(StyleFilterDTO filterDTO, Pageable pageable);
}
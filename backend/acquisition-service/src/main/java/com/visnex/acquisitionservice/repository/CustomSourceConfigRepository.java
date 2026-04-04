package com.visnex.acquisitionservice.repository;

import com.visnex.acquisitionservice.dto.input.SourceConfigFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultSourceConfigDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomSourceConfigRepository {
    Page<ResultSourceConfigDTO> findAllWithCriteria(SourceConfigFilterDTO filterDTO, Pageable pageable);
}

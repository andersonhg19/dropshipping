package com.visnex.acquisitionservice.repository;

import com.visnex.acquisitionservice.dto.input.ImportJobFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultImportJobDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomImportJobRepository {
    Page<ResultImportJobDTO> findAllWithCriteria(ImportJobFilterDTO filterDTO, Pageable pageable);
}

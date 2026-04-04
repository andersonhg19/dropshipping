package com.visnex.acquisitionservice.repository;

import com.visnex.acquisitionservice.dto.input.ImportTemplateFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultImportTemplateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomImportTemplateRepository {
    Page<ResultImportTemplateDTO> findAllWithCriteria(ImportTemplateFilterDTO filterDTO, Pageable pageable);
}

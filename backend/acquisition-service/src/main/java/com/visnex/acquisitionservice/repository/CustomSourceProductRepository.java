package com.visnex.acquisitionservice.repository;

import com.visnex.acquisitionservice.dto.input.SourceProductFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultSourceProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomSourceProductRepository {
    Page<ResultSourceProductDTO> findAllWithCriteria(SourceProductFilterDTO filterDTO, Pageable pageable);
}

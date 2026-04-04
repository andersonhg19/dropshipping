package com.visnex.acquisitionservice.repository;

import com.visnex.acquisitionservice.dto.input.SupplierFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultSupplierDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomSupplierRepository {
    Page<ResultSupplierDTO> findAllWithCriteria(SupplierFilterDTO filterDTO, Pageable pageable);
}

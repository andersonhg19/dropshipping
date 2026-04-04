package com.visnex.acquisitionservice.service;

import com.visnex.acquisitionservice.dto.input.SupplierDTO;
import com.visnex.acquisitionservice.dto.input.SupplierFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;

public interface SupplierService {

    ResultDTO saveAndUpdate(SupplierDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(SupplierFilterDTO filterDTO, String language) throws Exception;
}

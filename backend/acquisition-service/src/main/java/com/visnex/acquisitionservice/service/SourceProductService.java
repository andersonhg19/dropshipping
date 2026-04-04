package com.visnex.acquisitionservice.service;

import com.visnex.acquisitionservice.dto.input.SourceProductDTO;
import com.visnex.acquisitionservice.dto.input.SourceProductFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;

public interface SourceProductService {

    ResultDTO saveAndUpdate(SourceProductDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(SourceProductFilterDTO filterDTO, String language) throws Exception;
}

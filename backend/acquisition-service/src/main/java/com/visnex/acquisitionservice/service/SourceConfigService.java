package com.visnex.acquisitionservice.service;

import com.visnex.acquisitionservice.dto.input.SourceConfigDTO;
import com.visnex.acquisitionservice.dto.input.SourceConfigFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;

public interface SourceConfigService {

    ResultDTO saveAndUpdate(SourceConfigDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(SourceConfigFilterDTO filterDTO, String language) throws Exception;
}

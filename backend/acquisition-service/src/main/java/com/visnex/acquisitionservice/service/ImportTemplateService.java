package com.visnex.acquisitionservice.service;

import com.visnex.acquisitionservice.dto.input.ImportTemplateDTO;
import com.visnex.acquisitionservice.dto.input.ImportTemplateFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;

public interface ImportTemplateService {

    ResultDTO saveAndUpdate(ImportTemplateDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(ImportTemplateFilterDTO filterDTO, String language) throws Exception;
}

package com.visnex.acquisitionservice.service;

import com.visnex.acquisitionservice.dto.input.ImportJobDTO;
import com.visnex.acquisitionservice.dto.input.ImportJobFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;

public interface ImportJobService {

    ResultDTO saveAndUpdate(ImportJobDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(ImportJobFilterDTO filterDTO, String language) throws Exception;
}

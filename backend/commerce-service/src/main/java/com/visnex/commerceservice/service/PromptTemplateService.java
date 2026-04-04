package com.visnex.commerceservice.service;

import com.visnex.commerceservice.dto.input.PromptTemplateDTO;
import com.visnex.commerceservice.dto.input.PromptTemplateFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;

public interface PromptTemplateService {

    ResultDTO saveAndUpdate(PromptTemplateDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(PromptTemplateFilterDTO filterDTO, String language) throws Exception;
}

package com.visnex.commerceservice.service;

import com.visnex.commerceservice.dto.input.EnrichmentConfigDTO;
import com.visnex.commerceservice.dto.input.EnrichmentConfigFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;

public interface EnrichmentConfigService {

    ResultDTO saveAndUpdate(EnrichmentConfigDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(EnrichmentConfigFilterDTO filterDTO, String language) throws Exception;
}

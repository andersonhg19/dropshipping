package com.visnex.commerceservice.service;

import com.visnex.commerceservice.dto.input.PricingConfigDTO;
import com.visnex.commerceservice.dto.input.PricingConfigFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;

public interface PricingConfigService {

    ResultDTO saveAndUpdate(PricingConfigDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(PricingConfigFilterDTO filterDTO, String language) throws Exception;
}

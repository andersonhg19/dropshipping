package com.visnex.commerceservice.service;

import com.visnex.commerceservice.dto.input.PromotionDTO;
import com.visnex.commerceservice.dto.input.PromotionFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;

public interface PromotionService {

    ResultDTO saveAndUpdate(PromotionDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(PromotionFilterDTO filterDTO, String language) throws Exception;
}

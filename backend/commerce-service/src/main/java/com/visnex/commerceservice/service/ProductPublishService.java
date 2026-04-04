package com.visnex.commerceservice.service;

import com.visnex.commerceservice.dto.input.ProductPublishDTO;
import com.visnex.commerceservice.dto.input.ProductPublishFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;

public interface ProductPublishService {

    ResultDTO saveAndUpdate(ProductPublishDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(ProductPublishFilterDTO filterDTO, String language) throws Exception;
}

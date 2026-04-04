package com.visnex.commerceservice.service;

import com.visnex.commerceservice.dto.input.ProductImageDTO;
import com.visnex.commerceservice.dto.input.ProductImageFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;

public interface ProductImageService {

    ResultDTO saveAndUpdate(ProductImageDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(ProductImageFilterDTO filterDTO, String language) throws Exception;
}

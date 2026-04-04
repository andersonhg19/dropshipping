package com.visnex.commerceservice.service;

import com.visnex.commerceservice.dto.input.ProductDTO;
import com.visnex.commerceservice.dto.input.ProductFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;

public interface ProductService {

    ResultDTO saveAndUpdate(ProductDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(ProductFilterDTO filterDTO, String language) throws Exception;
}

package com.visnex.commerceservice.service;

import com.visnex.commerceservice.dto.input.CategoryDTO;
import com.visnex.commerceservice.dto.input.CategoryFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;

public interface CategoryService {

    ResultDTO saveAndUpdate(CategoryDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(CategoryFilterDTO filterDTO, String language) throws Exception;
}

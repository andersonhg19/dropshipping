package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.dto.input.PromptTemplateFilterDTO;
import com.visnex.commerceservice.entity.PromptTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomPromptTemplateRepository {
    Page<PromptTemplate> findAllWithCriteria(PromptTemplateFilterDTO filterDTO, Pageable pageable);
}

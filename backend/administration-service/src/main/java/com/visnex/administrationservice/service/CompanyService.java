package com.visnex.administrationservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.dto.input.CompanyDTO;
import com.visnex.administrationservice.dto.input.CompanyFilterDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;

import java.net.URISyntaxException;

public interface CompanyService {

    public abstract ResultDTO saveAndUpdate(CompanyDTO companyDTO, String language)  throws Exception;
    public abstract ResultDTO getById(Long id, String language) throws Exception;
    public abstract ResultDTO getAllItems(CompanyFilterDTO filterDTO, String language) throws URISyntaxException, JsonProcessingException;
}
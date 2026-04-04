package com.visnex.administrationservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.dto.input.ModuleDTO;
import com.visnex.administrationservice.dto.input.ModuleFilterDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;

import java.net.URISyntaxException;

public interface ModuleService {

    public abstract ResultDTO saveAndUpdate(ModuleDTO moduleDTO, String language)  throws Exception;
    public abstract ResultDTO getById(Long id, String language) throws Exception;
    public abstract ResultDTO getAllItems(ModuleFilterDTO filterDTO, String language) throws URISyntaxException, JsonProcessingException;
}
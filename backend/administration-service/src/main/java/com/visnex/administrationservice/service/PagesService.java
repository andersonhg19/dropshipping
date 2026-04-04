package com.visnex.administrationservice.service;

import com.visnex.administrationservice.dto.input.PagesDTO;
import com.visnex.administrationservice.dto.input.PagesFilterDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;

public interface PagesService {

    public abstract ResultDTO saveAndUpdate(PagesDTO pagesDTO, String language)  throws Exception;
    public abstract ResultDTO getById(long id, String language) throws Exception;
    public abstract ResultDTO getAllItems(PagesFilterDTO pagesFilterDTO, String language) throws Exception;
}
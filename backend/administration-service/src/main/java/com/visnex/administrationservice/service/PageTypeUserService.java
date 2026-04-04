package com.visnex.administrationservice.service;

import com.visnex.administrationservice.dto.input.PageTypeUserByTypeFilterDTO;
import com.visnex.administrationservice.dto.input.PageTypeUserFilterDTO;
import com.visnex.administrationservice.dto.input.PageTypeUserSaveDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;

public interface PageTypeUserService {
    ResultDTO saveAndUpdate(PageTypeUserSaveDTO dto, String language)  throws Exception;
    ResultDTO getById(long id, String language) throws Exception;
    ResultDTO getByIdTypeUser(PageTypeUserByTypeFilterDTO filterDTO, String language) throws Exception;
    ResultDTO getAllItems(PageTypeUserFilterDTO filterDTO, String language) throws Exception;
}
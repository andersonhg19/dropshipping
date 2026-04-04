package com.visnex.administrationservice.service;


import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.input.SubsidiaryDTO;
import com.visnex.administrationservice.dto.input.SubsidiaryFilterDTO;
import com.visnex.administrationservice.dto.output.ResultSubsidiaryDTO;

public interface SubsidiaryService {

    ResultSubsidiaryDTO saveAndUpdate(SubsidiaryDTO dto);
    ResultSubsidiaryDTO getById(Long id);
    PageDTO<ResultSubsidiaryDTO> getAllItems(SubsidiaryFilterDTO filter);
    void setActive(Long id, boolean active);
}
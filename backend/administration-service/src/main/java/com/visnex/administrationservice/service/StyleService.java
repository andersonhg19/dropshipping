package com.visnex.administrationservice.service;


import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.input.StyleUpsertListDTO;
import com.visnex.administrationservice.dto.input.StyleFilterDTO;
import com.visnex.administrationservice.dto.output.ResultStyleDTO;
import com.visnex.administrationservice.dto.output.ResultStyleUpsertListDTO;

public interface StyleService {
    ResultStyleUpsertListDTO saveAndUpdate(StyleUpsertListDTO dto);
    ResultStyleDTO getById(Long id);
    PageDTO<ResultStyleDTO> search(StyleFilterDTO filter);
    void setActive(Long id, boolean active);

    /** Trae style por (company, [subsidiary], name) respetando la unicidad. */
    ResultStyleDTO lookup(Long idCompany, Long idSubsidiary, String name);
}
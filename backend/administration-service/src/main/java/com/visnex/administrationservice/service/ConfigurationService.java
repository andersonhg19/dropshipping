package com.visnex.administrationservice.service;

import com.visnex.administrationservice.dto.input.ConfigurationFilterDTO;
import com.visnex.administrationservice.dto.input.ConfigurationUpsertListDTO;
import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.output.ResultConfigurationDTO;
import com.visnex.administrationservice.dto.output.ResultConfigurationUpsertListDTO;

public interface ConfigurationService {
    ResultConfigurationUpsertListDTO saveAndUpdate(ConfigurationUpsertListDTO dto);
    ResultConfigurationDTO getById(Long id);
    PageDTO<ResultConfigurationDTO> search(ConfigurationFilterDTO filter);
    void setActive(Long id, boolean active);

    /** Útil para clientes: trae config por (company, [subsidiary], name) */
    ResultConfigurationDTO lookup(Long idCompany, Long idSubsidiary, String name);
}

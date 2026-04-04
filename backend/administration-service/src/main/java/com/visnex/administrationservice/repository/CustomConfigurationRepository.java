package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.dto.input.ConfigurationFilterDTO;
import com.visnex.administrationservice.dto.output.ResultConfigurationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomConfigurationRepository {
    Page<ResultConfigurationDTO> findAllWithCriteria(ConfigurationFilterDTO filterDTO, Pageable pageable);
}
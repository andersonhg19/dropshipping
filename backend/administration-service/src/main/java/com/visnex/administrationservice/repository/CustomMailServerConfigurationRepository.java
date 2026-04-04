package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.dto.input.MailServerConfigurationFilterDTO;
import com.visnex.administrationservice.dto.output.ResultMailServerConfigurationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomMailServerConfigurationRepository {
    Page<ResultMailServerConfigurationDTO> findAllWithCriteria(MailServerConfigurationFilterDTO filterDTO, Pageable pageable);
}
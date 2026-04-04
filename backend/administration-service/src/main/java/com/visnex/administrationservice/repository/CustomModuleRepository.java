package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.dto.input.ModuleFilterDTO;
import com.visnex.administrationservice.dto.input.UserFilterDTO;
import com.visnex.administrationservice.dto.output.ResultModuleDTO;
import com.visnex.administrationservice.dto.output.ResultUserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomModuleRepository {
    Page<ResultModuleDTO> findAllWithCriteria(ModuleFilterDTO filter, Pageable pageable);
}
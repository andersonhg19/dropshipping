package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.dto.input.UserFilterDTO;
import com.visnex.administrationservice.dto.output.ResultUserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomUserRepository {
    Page<ResultUserDTO> findAllWithCriteria(UserFilterDTO filter, Pageable pageable);
}

package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.dto.input.PageTypeUserFilterDTO;
import com.visnex.administrationservice.dto.output.ResultPageTypeUserDTO;
import com.visnex.administrationservice.entity.PageTypeUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomPageTypeUserRepository {
    Page<ResultPageTypeUserDTO> findAllWithCriteria(PageTypeUserFilterDTO filterDTO, Pageable pageable);
}
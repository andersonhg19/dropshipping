package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.dto.input.TypeUserFilterDTO;
import com.visnex.administrationservice.dto.output.ResultTypeUserDTO;
import com.visnex.administrationservice.entity.TypeUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomTypeUserRepository {
    Page<ResultTypeUserDTO> findAllWithCriteria(TypeUserFilterDTO filterDTO, Pageable pageable);
}
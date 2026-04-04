package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.dto.input.PagesFilterDTO;
import com.visnex.administrationservice.dto.output.ResultPagesDTO;
import com.visnex.administrationservice.entity.Pages;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomPagesRepository {
    Page<ResultPagesDTO> findAllWithCriteria(PagesFilterDTO filterDTO, Pageable pageable);
}
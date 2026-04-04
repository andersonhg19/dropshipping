package com.visnex.administrationservice.mapper;

import com.visnex.administrationservice.dto.input.PagesDTO;
import com.visnex.administrationservice.dto.output.ResultPagesDTO;
import com.visnex.administrationservice.entity.Pages;
import com.visnex.administrationservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PagesMapper extends BaseMapper<Pages, PagesDTO, ResultPagesDTO> {

    @Override
    @Mapping(target = "idModule", expression = "java(pages.getModule() != null ? pages.getModule().getId() : null)")
    @Mapping(target = "moduleName", expression = "java(pages.getModule() != null ? pages.getModule().getName() : null)")
    @Mapping(target = "idModifiedBy", expression = "java(pages.getModifiedBy() != null ? pages.getModifiedBy().getId() : null)")
    @Mapping(target = "modifiedBy", expression = "java(pages.getModifiedBy() != null ? pages.getModifiedBy().getName() : null)")
    ResultPagesDTO toDTO(Pages pages);

    @Override
    Pages toEntity(PagesDTO dto);
}

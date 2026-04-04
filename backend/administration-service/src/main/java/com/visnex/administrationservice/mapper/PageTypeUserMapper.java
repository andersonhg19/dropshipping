package com.visnex.administrationservice.mapper;

import com.visnex.administrationservice.dto.input.PageTypeUserDTO;
import com.visnex.administrationservice.dto.output.ResultPageTypeUserDTO;
import com.visnex.administrationservice.entity.PageTypeUser;
import com.visnex.administrationservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PageTypeUserMapper extends BaseMapper<PageTypeUser, PageTypeUserDTO, ResultPageTypeUserDTO> {

    @Override
    @Mapping(target = "idPage", expression = "java(pageTypeUser.getPage() != null ? pageTypeUser.getPage().getId() : null)")
    @Mapping(target = "pageName", expression = "java(pageTypeUser.getPage() != null ? pageTypeUser.getPage().getName() : null)")
    @Mapping(target = "idTypeUser", expression = "java(pageTypeUser.getTypeUser() != null ? pageTypeUser.getTypeUser().getId() : null)")
    @Mapping(target = "typeUserName", expression = "java(pageTypeUser.getTypeUser() != null ? pageTypeUser.getTypeUser().getName() : null)")
    @Mapping(target = "idModifiedBy", expression = "java(pageTypeUser.getModifiedBy() != null ? pageTypeUser.getModifiedBy().getId() : null)")
    @Mapping(target = "modifiedBy", expression = "java(pageTypeUser.getModifiedBy() != null ? pageTypeUser.getModifiedBy().getName() : null)")
    ResultPageTypeUserDTO toDTO(PageTypeUser pageTypeUser);

    @Override
    PageTypeUser toEntity(PageTypeUserDTO dto);

}

package com.visnex.administrationservice.mapper;

import com.visnex.administrationservice.dto.input.UserDTO;
import com.visnex.administrationservice.dto.output.ResultUserDTO;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper extends BaseMapper<User, UserDTO, ResultUserDTO> {

    @Override
    @Mapping(target = "idCompany",     expression = "java(user.getCompany() != null ? user.getCompany().getId() : null)")
    @Mapping(target = "companyName",   expression = "java(user.getCompany() != null ? user.getCompany().getName() : null)")

    @Mapping(target = "idSubsidiary",   expression = "java(user.getSubsidiary() != null ? user.getSubsidiary().getId() : null)")
    @Mapping(target = "subsidiaryName", expression = "java(user.getSubsidiary() != null ? user.getSubsidiary().getName() : null)")

    @Mapping(target = "idModifiedBy", expression = "java(user.getModifiedBy() != null ? user.getModifiedBy().getId() : null)")
    @Mapping(target = "modifiedBy",   expression = "java(user.getModifiedBy() != null ? user.getModifiedBy().getName() : null)")

    @Mapping(target = "idTypeUser",   expression = "java(user.getTypeUser() != null ? user.getTypeUser().getId() : null)")
    @Mapping(target = "typeUserName", expression = "java(user.getTypeUser() != null ? user.getTypeUser().getName() : null)")
    ResultUserDTO toDTO(User user);

    @Override
    User toEntity(UserDTO dto);
}

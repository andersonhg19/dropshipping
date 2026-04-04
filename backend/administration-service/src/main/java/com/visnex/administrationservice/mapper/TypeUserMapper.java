package com.visnex.administrationservice.mapper;

import com.visnex.administrationservice.dto.input.TypeUserDTO;
import com.visnex.administrationservice.dto.output.ResultTypeUserDTO;
import com.visnex.administrationservice.entity.TypeUser;
import com.visnex.administrationservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TypeUserMapper extends BaseMapper<TypeUser, TypeUserDTO, ResultTypeUserDTO> {

    @Override
    @Mapping(target = "idCompany", expression = "java(typeUser.getCompany() != null ? typeUser.getCompany().getId() : null)")
    @Mapping(target = "companyName", expression = "java(typeUser.getCompany() != null ? typeUser.getCompany().getName() : null)")
    @Mapping(target = "idSubsidiary", expression = "java(typeUser.getSubsidiary() != null ? typeUser.getSubsidiary().getId() : null)")
    @Mapping(target = "subsidiaryName", expression = "java(typeUser.getSubsidiary() != null ? typeUser.getSubsidiary().getName() : null)")
    @Mapping(target = "idModifiedBy", expression = "java(typeUser.getModifiedBy() != null ? typeUser.getModifiedBy().getId() : null)")
    @Mapping(target = "modifiedBy", expression = "java(typeUser.getModifiedBy() != null ? typeUser.getModifiedBy().getName() : null)")
    ResultTypeUserDTO toDTO(TypeUser typeUser);

    @Override
    TypeUser toEntity(TypeUserDTO dto);
}

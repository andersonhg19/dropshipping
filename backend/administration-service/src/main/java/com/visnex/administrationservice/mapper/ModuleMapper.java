package com.visnex.administrationservice.mapper;

import com.visnex.administrationservice.dto.input.ModuleDTO;
import com.visnex.administrationservice.dto.output.ResultModuleDTO;
import com.visnex.administrationservice.entity.Module;
import com.visnex.administrationservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ModuleMapper extends BaseMapper<Module, ModuleDTO, ResultModuleDTO> {

    @Override
    @Mapping(target = "idModifiedBy", expression = "java(module.getModifiedBy() != null ? module.getModifiedBy().getId() : null)")
    @Mapping(target = "modifiedBy", expression = "java(module.getModifiedBy() != null ? module.getModifiedBy().getName() : null)")
    ResultModuleDTO toDTO(Module module);

    @Override
    Module toEntity(ModuleDTO dto);
}

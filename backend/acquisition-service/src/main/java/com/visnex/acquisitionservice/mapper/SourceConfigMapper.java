package com.visnex.acquisitionservice.mapper;

import com.visnex.acquisitionservice.dto.input.SourceConfigDTO;
import com.visnex.acquisitionservice.dto.output.ResultSourceConfigDTO;
import com.visnex.acquisitionservice.entity.SourceConfig;
import com.visnex.acquisitionservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SourceConfigMapper extends BaseMapper<SourceConfig, SourceConfigDTO, ResultSourceConfigDTO> {

    @Override
    ResultSourceConfigDTO toDTO(SourceConfig entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "lastSync", ignore = true)
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    SourceConfig toEntity(SourceConfigDTO dto);
}

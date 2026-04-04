package com.visnex.acquisitionservice.mapper;

import com.visnex.acquisitionservice.dto.input.SourceProductDTO;
import com.visnex.acquisitionservice.dto.output.ResultSourceProductDTO;
import com.visnex.acquisitionservice.entity.SourceProduct;
import com.visnex.acquisitionservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SourceProductMapper extends BaseMapper<SourceProduct, SourceProductDTO, ResultSourceProductDTO> {

    @Override
    ResultSourceProductDTO toDTO(SourceProduct entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    SourceProduct toEntity(SourceProductDTO dto);
}

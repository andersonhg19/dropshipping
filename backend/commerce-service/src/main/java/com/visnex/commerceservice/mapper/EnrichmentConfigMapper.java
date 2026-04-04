package com.visnex.commerceservice.mapper;

import com.visnex.commerceservice.dto.input.EnrichmentConfigDTO;
import com.visnex.commerceservice.dto.output.ResultEnrichmentConfigDTO;
import com.visnex.commerceservice.entity.EnrichmentConfig;
import com.visnex.commerceservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EnrichmentConfigMapper extends BaseMapper<EnrichmentConfig, EnrichmentConfigDTO, ResultEnrichmentConfigDTO> {

    @Override
    ResultEnrichmentConfigDTO toDTO(EnrichmentConfig entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    EnrichmentConfig toEntity(EnrichmentConfigDTO dto);
}

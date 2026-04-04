package com.visnex.commerceservice.mapper;

import com.visnex.commerceservice.dto.input.PricingConfigDTO;
import com.visnex.commerceservice.dto.output.ResultPricingConfigDTO;
import com.visnex.commerceservice.entity.PricingConfig;
import com.visnex.commerceservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PricingConfigMapper extends BaseMapper<PricingConfig, PricingConfigDTO, ResultPricingConfigDTO> {

    @Override
    ResultPricingConfigDTO toDTO(PricingConfig entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    PricingConfig toEntity(PricingConfigDTO dto);
}

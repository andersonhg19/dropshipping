package com.visnex.commerceservice.mapper;

import com.visnex.commerceservice.dto.input.PromotionDTO;
import com.visnex.commerceservice.dto.output.ResultPromotionDTO;
import com.visnex.commerceservice.entity.Promotion;
import com.visnex.commerceservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PromotionMapper extends BaseMapper<Promotion, PromotionDTO, ResultPromotionDTO> {

    @Override
    ResultPromotionDTO toDTO(Promotion entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    Promotion toEntity(PromotionDTO dto);
}

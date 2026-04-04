package com.visnex.commerceservice.mapper;

import com.visnex.commerceservice.dto.input.ProductPublishDTO;
import com.visnex.commerceservice.dto.output.ResultProductPublishDTO;
import com.visnex.commerceservice.entity.ProductPublish;
import com.visnex.commerceservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductPublishMapper extends BaseMapper<ProductPublish, ProductPublishDTO, ResultProductPublishDTO> {

    @Override
    ResultProductPublishDTO toDTO(ProductPublish entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    ProductPublish toEntity(ProductPublishDTO dto);
}

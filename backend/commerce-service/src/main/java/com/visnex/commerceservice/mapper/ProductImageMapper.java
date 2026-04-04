package com.visnex.commerceservice.mapper;

import com.visnex.commerceservice.dto.input.ProductImageDTO;
import com.visnex.commerceservice.dto.output.ResultProductImageDTO;
import com.visnex.commerceservice.entity.ProductImage;
import com.visnex.commerceservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductImageMapper extends BaseMapper<ProductImage, ProductImageDTO, ResultProductImageDTO> {

    @Override
    ResultProductImageDTO toDTO(ProductImage entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    ProductImage toEntity(ProductImageDTO dto);
}

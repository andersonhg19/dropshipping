package com.visnex.commerceservice.mapper;

import com.visnex.commerceservice.dto.input.ProductDTO;
import com.visnex.commerceservice.dto.output.ResultProductDTO;
import com.visnex.commerceservice.entity.Product;
import com.visnex.commerceservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper extends BaseMapper<Product, ProductDTO, ResultProductDTO> {

    @Override
    ResultProductDTO toDTO(Product entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    Product toEntity(ProductDTO dto);
}

package com.visnex.commerceservice.mapper;

import com.visnex.commerceservice.dto.input.CategoryDTO;
import com.visnex.commerceservice.dto.output.ResultCategoryDTO;
import com.visnex.commerceservice.entity.Category;
import com.visnex.commerceservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper extends BaseMapper<Category, CategoryDTO, ResultCategoryDTO> {

    @Override
    ResultCategoryDTO toDTO(Category entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    Category toEntity(CategoryDTO dto);
}

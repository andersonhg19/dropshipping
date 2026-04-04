package com.visnex.commerceservice.mapper;

import com.visnex.commerceservice.dto.input.PromptTemplateDTO;
import com.visnex.commerceservice.dto.output.ResultPromptTemplateDTO;
import com.visnex.commerceservice.entity.PromptTemplate;
import com.visnex.commerceservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PromptTemplateMapper extends BaseMapper<PromptTemplate, PromptTemplateDTO, ResultPromptTemplateDTO> {

    @Override
    ResultPromptTemplateDTO toDTO(PromptTemplate entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    PromptTemplate toEntity(PromptTemplateDTO dto);
}

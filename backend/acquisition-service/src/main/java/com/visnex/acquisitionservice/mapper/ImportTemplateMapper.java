package com.visnex.acquisitionservice.mapper;

import com.visnex.acquisitionservice.dto.input.ImportTemplateDTO;
import com.visnex.acquisitionservice.dto.output.ResultImportTemplateDTO;
import com.visnex.acquisitionservice.entity.ImportTemplate;
import com.visnex.acquisitionservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ImportTemplateMapper extends BaseMapper<ImportTemplate, ImportTemplateDTO, ResultImportTemplateDTO> {

    @Override
    ResultImportTemplateDTO toDTO(ImportTemplate entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    ImportTemplate toEntity(ImportTemplateDTO dto);
}

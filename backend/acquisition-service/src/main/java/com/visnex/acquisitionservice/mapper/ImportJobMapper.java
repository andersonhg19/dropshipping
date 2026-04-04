package com.visnex.acquisitionservice.mapper;

import com.visnex.acquisitionservice.dto.input.ImportJobDTO;
import com.visnex.acquisitionservice.dto.output.ResultImportJobDTO;
import com.visnex.acquisitionservice.entity.ImportJob;
import com.visnex.acquisitionservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ImportJobMapper extends BaseMapper<ImportJob, ImportJobDTO, ResultImportJobDTO> {

    @Override
    ResultImportJobDTO toDTO(ImportJob entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    ImportJob toEntity(ImportJobDTO dto);
}

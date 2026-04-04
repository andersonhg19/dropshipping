package com.visnex.administrationservice.mapper;

import com.visnex.administrationservice.dto.input.CompanyDTO;
import com.visnex.administrationservice.dto.output.ResultCompanyDTO;
import com.visnex.administrationservice.entity.Company;
import com.visnex.administrationservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CompanyMapper extends BaseMapper<Company, CompanyDTO, ResultCompanyDTO> {

    @Override
    @Mapping(target = "idModifiedBy", expression = "java(company.getModifiedBy() != null ? company.getModifiedBy().getId() : null)")
    @Mapping(target = "modifiedBy", expression = "java(company.getModifiedBy() != null ? company.getModifiedBy().getName() : null)")
    ResultCompanyDTO toDTO(Company company);

    @Override
    Company toEntity(CompanyDTO dto);
}

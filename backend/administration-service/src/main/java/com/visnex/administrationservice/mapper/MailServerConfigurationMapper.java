package com.visnex.administrationservice.mapper;

import com.visnex.administrationservice.dto.input.MailServerConfigurationDTO;
import com.visnex.administrationservice.dto.output.ResultMailServerConfigurationDTO;
import com.visnex.administrationservice.entity.MailServerConfiguration;
import com.visnex.administrationservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MailServerConfigurationMapper extends BaseMapper<MailServerConfiguration, MailServerConfigurationDTO, ResultMailServerConfigurationDTO> {

    @Override
    @Mapping(target = "idCompany", expression = "java(config.getCompany() != null ? config.getCompany().getId() : null)")
    @Mapping(target = "companyName", expression = "java(config.getCompany() != null ? config.getCompany().getName() : null)")
    @Mapping(target = "idSubsidiary", expression = "java(config.getSubsidiary() != null ? config.getSubsidiary().getId() : null)")
    @Mapping(target = "subsidiaryName", expression = "java(config.getSubsidiary() != null ? config.getSubsidiary().getName() : null)")
    @Mapping(target = "idModifiedBy", expression = "java(config.getModifiedBy() != null ? config.getModifiedBy().getId() : null)")
    @Mapping(target = "modifiedBy", expression = "java(config.getModifiedBy() != null ? config.getModifiedBy().getName() : null)")
    ResultMailServerConfigurationDTO toDTO(MailServerConfiguration config);

    @Override
    MailServerConfiguration toEntity(MailServerConfigurationDTO dto);
}

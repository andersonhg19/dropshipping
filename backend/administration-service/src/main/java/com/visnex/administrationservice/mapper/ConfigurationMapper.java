package com.visnex.administrationservice.mapper;

import com.visnex.administrationservice.dto.input.ConfigurationDTO;
import com.visnex.administrationservice.dto.output.ResultConfigurationDTO;
import com.visnex.administrationservice.entity.Company;
import com.visnex.administrationservice.entity.Configuration;
import com.visnex.administrationservice.entity.Subsidiary;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ConfigurationMapper extends BaseMapper<Configuration, ConfigurationDTO, ResultConfigurationDTO> {

    /* ===== Entity -> DTO de salida ===== */
    @Override
    @Mappings({
            @Mapping(target = "idCompany",
                    expression = "java( cfg.getCompany()!=null ? cfg.getCompany().getId() : null )"),
            @Mapping(target = "companyName",
                    expression = "java( cfg.getCompany()!=null ? cfg.getCompany().getName() : null )"),
            @Mapping(target = "idSubsidiary",
                    expression = "java( cfg.getSubsidiary()!=null ? cfg.getSubsidiary().getId() : null )"),
            @Mapping(target = "subsidiaryName",
                    expression = "java( cfg.getSubsidiary()!=null ? cfg.getSubsidiary().getName() : null )"),
            @Mapping(target = "idModifiedBy",
                    expression = "java( cfg.getModifiedBy()!=null ? cfg.getModifiedBy().getId() : null )"),
            @Mapping(target = "modifiedBy",
                    expression = "java( cfg.getModifiedBy()!=null ? cfg.getModifiedBy().getName() : null )")
    })
    ResultConfigurationDTO toDTO(Configuration cfg);

    @Override
    List<ResultConfigurationDTO> toDTOList(List<Configuration> entities);

    /* ===== DTO de entrada -> Entity =====
       No golpeamos la DB aquí: sólo seteamos entidades “proxy” por ID.
       Los timestamps los maneja Hibernate.
    */
    @Override
    @Mappings({
            @Mapping(target = "company",     expression = "java(fromCompanyId(dto.getIdCompany()))"),
            @Mapping(target = "subsidiary",  expression = "java(fromSubsidiaryId(dto.getIdSubsidiary()))"),
            @Mapping(target = "modifiedBy",  expression = "java(fromUserId(dto.getIdModifiedBy()))"),
            @Mapping(target = "creation",    ignore = true),
            @Mapping(target = "lastUpdate",  ignore = true)
    })
    Configuration toEntity(ConfigurationDTO dto);

    /* ===== Helpers ===== */
    default Company fromCompanyId(Long id) {
        if (id == null) return null;
        Company c = new Company();
        c.setId(id);
        return c;
    }
    default Subsidiary fromSubsidiaryId(Long id) {
        if (id == null) return null;
        Subsidiary s = new Subsidiary();
        s.setId(id);
        return s;
    }
    default User fromUserId(Long id) {
        if (id == null) return null;
        User u = new User();
        u.setId(id);
        return u;
    }
}

package com.visnex.administrationservice.mapper;

import com.visnex.administrationservice.dto.input.StyleDTO;
import com.visnex.administrationservice.dto.output.ResultStyleDTO;
import com.visnex.administrationservice.entity.Company;
import com.visnex.administrationservice.entity.Subsidiary;
import com.visnex.administrationservice.entity.Style;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import java.util.List;

@Mapper(componentModel = "spring")
public interface StyleMapper extends BaseMapper<Style, StyleDTO, ResultStyleDTO> {

    /* ===== Entity -> DTO de salida ===== */
    @Override
    @Mappings({
            @Mapping(target = "idCompany",
                    expression = "java( s.getCompany()!=null ? s.getCompany().getId() : null )"),
            @Mapping(target = "companyName",
                    expression = "java( s.getCompany()!=null ? s.getCompany().getName() : null )"),
            @Mapping(target = "idSubsidiary",
                    expression = "java( s.getSubsidiary()!=null ? s.getSubsidiary().getId() : null )"),
            @Mapping(target = "subsidiaryName",
                    expression = "java( s.getSubsidiary()!=null ? s.getSubsidiary().getName() : null )"),
            @Mapping(target = "idModifiedBy",
                    expression = "java( s.getModifiedBy()!=null ? s.getModifiedBy().getId() : null )"),
            @Mapping(target = "modifiedBy",
                    expression = "java( s.getModifiedBy()!=null ? s.getModifiedBy().getName() : null )")
    })
    ResultStyleDTO toDTO(Style s);

    @Override
    List<ResultStyleDTO> toDTOList(List<Style> entities);

    /* ===== DTO de entrada -> Entity =====
       Sólo seteamos relaciones por ID (sin ir a DB); timestamps los maneja Hibernate.
    */
    @Override
    @Mappings({
            @Mapping(target = "company",     expression = "java(fromCompanyId(dto.getIdCompany()))"),
            @Mapping(target = "subsidiary",  expression = "java(fromSubsidiaryId(dto.getIdSubsidiary()))"),
            @Mapping(target = "modifiedBy",  expression = "java(fromUserId(dto.getIdModifiedBy()))"),
            @Mapping(target = "creation",    ignore = true),
            @Mapping(target = "lastUpdate",  ignore = true)
    })
    Style toEntity(StyleDTO dto);

    /* ===== Helpers ===== */
    default Company fromCompanyId(Long id) {
        if (id == null) return null;
        Company c = new Company(); c.setId(id); return c;
    }
    default Subsidiary fromSubsidiaryId(Long id) {
        if (id == null) return null;
        Subsidiary s = new Subsidiary(); s.setId(id); return s;
    }
    default User fromUserId(Long id) {
        if (id == null) return null;
        User u = new User(); u.setId(id); return u;
    }
}

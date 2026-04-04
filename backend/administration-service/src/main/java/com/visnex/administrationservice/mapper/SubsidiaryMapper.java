package com.visnex.administrationservice.mapper;

import com.visnex.administrationservice.dto.input.SubsidiaryDTO;
import com.visnex.administrationservice.dto.output.ResultSubsidiaryDTO;
import com.visnex.administrationservice.entity.Company;
import com.visnex.administrationservice.entity.Subsidiary;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SubsidiaryMapper extends BaseMapper<Subsidiary, SubsidiaryDTO, ResultSubsidiaryDTO> {

    @Override
    @Mapping(target = "idCompany", expression = "java(subsidiary.getCompany() != null ? subsidiary.getCompany().getId() : null)")
    @Mapping(target = "companyName", expression = "java(subsidiary.getCompany() != null ? subsidiary.getCompany().getName() : null)")
    @Mapping(target = "idModifiedBy", expression = "java(subsidiary.getModifiedBy() != null ? subsidiary.getModifiedBy().getId() : null)")
    @Mapping(target = "modifiedBy", expression = "java(subsidiary.getModifiedBy() != null ? subsidiary.getModifiedBy().getName() : null)")
    ResultSubsidiaryDTO toDTO(Subsidiary subsidiary);

    @Override
    List<ResultSubsidiaryDTO> toDTOList(List<Subsidiary> entities);


    /* ===== DTO de entrada -> Entity ===== */
    @Override
    @Mappings({
            @Mapping(target = "company",     expression = "java(fromCompanyId(dto.getIdCompany()))"),
            @Mapping(target = "modifiedBy",  expression = "java(fromUserId(dto.getIdModifiedBy()))"),
            @Mapping(target = "creation",    ignore = true),
            @Mapping(target = "lastUpdate",  ignore = true)
    })
    Subsidiary toEntity(SubsidiaryDTO dto);

    @Override
    List<Subsidiary> toEntityList(List<SubsidiaryDTO> dtos);


    /* ===== Helpers para setear solo IDs en relaciones (sin ir a DB desde el mapper) ===== */
    default Company fromCompanyId(Long id) {
        if (id == null) return null;
        Company c = new Company();
        c.setId(id);
        return c;
    }

    default User fromUserId(Long id) {
        if (id == null) return null;
        User u = new User();
        u.setId(id);
        return u;
    }
}

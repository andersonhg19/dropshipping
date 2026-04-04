package com.visnex.acquisitionservice.mapper;

import com.visnex.acquisitionservice.dto.input.SupplierDTO;
import com.visnex.acquisitionservice.dto.output.ResultSupplierDTO;
import com.visnex.acquisitionservice.entity.Supplier;
import com.visnex.acquisitionservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SupplierMapper extends BaseMapper<Supplier, SupplierDTO, ResultSupplierDTO> {

    @Override
    ResultSupplierDTO toDTO(Supplier entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    Supplier toEntity(SupplierDTO dto);
}

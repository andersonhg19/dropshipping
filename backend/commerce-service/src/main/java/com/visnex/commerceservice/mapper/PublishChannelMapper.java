package com.visnex.commerceservice.mapper;

import com.visnex.commerceservice.dto.input.PublishChannelDTO;
import com.visnex.commerceservice.dto.output.ResultPublishChannelDTO;
import com.visnex.commerceservice.entity.PublishChannel;
import com.visnex.commerceservice.util.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PublishChannelMapper extends BaseMapper<PublishChannel, PublishChannelDTO, ResultPublishChannelDTO> {

    @Override
    ResultPublishChannelDTO toDTO(PublishChannel entity);

    @Override
    @Mapping(target = "companyId", source = "idCompany")
    @Mapping(target = "subsidiaryId", source = "idSubsidiary")
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    PublishChannel toEntity(PublishChannelDTO dto);
}

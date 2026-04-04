package com.visnex.commerceservice.service;

import com.visnex.commerceservice.dto.input.PublishChannelDTO;
import com.visnex.commerceservice.dto.input.PublishChannelFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;

public interface PublishChannelService {

    ResultDTO saveAndUpdate(PublishChannelDTO dto, String language) throws Exception;

    ResultDTO getById(Long id, String language) throws Exception;

    ResultDTO getAllItems(PublishChannelFilterDTO filterDTO, String language) throws Exception;
}

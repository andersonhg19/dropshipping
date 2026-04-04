package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.dto.input.PublishChannelFilterDTO;
import com.visnex.commerceservice.entity.PublishChannel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomPublishChannelRepository {
    Page<PublishChannel> findAllWithCriteria(PublishChannelFilterDTO filterDTO, Pageable pageable);
}

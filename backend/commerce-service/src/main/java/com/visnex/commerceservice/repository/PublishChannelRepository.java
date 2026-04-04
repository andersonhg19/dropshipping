package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.entity.PublishChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PublishChannelRepository extends JpaRepository<PublishChannel, Long>, CustomPublishChannelRepository {
    Optional<PublishChannel> findFirstByNameAndCompanyIdAndActive(String name, Long companyId, Boolean active);
}

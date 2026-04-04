package com.visnex.repository;

import com.visnex.entity.MessageLabels;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessageLabelsRepository extends JpaRepository<MessageLabels, String> {
    Collection<MessageLabels> findAllById(String id);

    @NotNull
    Page<MessageLabels> findAll(@NotNull Pageable pageable);

    Optional<MessageLabels> findByIdkeyAndIdlanguage(String idkey, String idlanguage);

    List<MessageLabels> findByIdkeyInAndIdlanguage(List<String> idkeys, String idlanguage);
}

package com.visnex.repository;

import com.visnex.entity.Keyword;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface KeywordRepository extends JpaRepository<Keyword, String> {
    Collection<Keyword> findAllById(String id);

    @NotNull
    Page<Keyword> findAll(@NotNull Pageable pageable);

    Optional<Keyword> findByKey(String key);

}

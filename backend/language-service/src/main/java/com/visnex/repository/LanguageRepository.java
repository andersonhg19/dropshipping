package com.visnex.repository;

import com.visnex.entity.Language;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface LanguageRepository extends JpaRepository<Language, String> {

    Collection<Language> findAllById(String id);

    @NotNull
    Page<Language> findAll(@NotNull Pageable pageable);

    Optional<Language> findByLanguage(String language);

}

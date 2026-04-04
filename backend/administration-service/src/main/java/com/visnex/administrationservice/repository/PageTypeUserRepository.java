package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.entity.PageTypeUser;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface PageTypeUserRepository extends JpaRepository<PageTypeUser, Long> {

    // Campo en la entidad es 'page', NO 'pages'
    Collection<PageTypeUser> findAllByPage_IdAndTypeUser_Id(Long pageId, Long typeUserId);

    // Para getByIdTypeUser
    Page<PageTypeUser> findByTypeUser_IdAndActive(Long typeUserId, Boolean active, Pageable pageable);
}
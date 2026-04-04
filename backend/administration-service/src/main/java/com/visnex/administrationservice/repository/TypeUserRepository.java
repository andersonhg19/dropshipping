package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.entity.TypeUser;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TypeUserRepository extends JpaRepository<TypeUser, Long> {
    List<TypeUser> findAllByName(String name);
    Optional<TypeUser> findByName(String name);
}

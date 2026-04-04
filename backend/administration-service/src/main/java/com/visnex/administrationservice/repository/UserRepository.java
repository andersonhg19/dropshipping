package com.visnex.administrationservice.repository;

import com.visnex.administrationservice.entity.User;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findById(long id);
    List<User> findByEmail(String email);
    Optional<User> findByDni(String dni);
}

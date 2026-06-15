package com.example.library.repository;

import com.example.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);

    User findByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.email = :val OR u.username = :val")
    User findByEmailOrUsername(@Param("val") String val);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
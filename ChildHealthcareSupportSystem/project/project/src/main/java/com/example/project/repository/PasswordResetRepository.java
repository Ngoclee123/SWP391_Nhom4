package com.example.project.repository;

import com.example.project.model.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Integer> {
    PasswordReset findByToken(String token);
}
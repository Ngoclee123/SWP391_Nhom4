<<<<<<< HEAD
package com.example.project.repository;

import com.example.project.model.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Integer> {
    PasswordReset findByToken(String token);
=======
package com.example.project.repository;

import com.example.project.model.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Integer> {
    PasswordReset findByToken(String token);
>>>>>>> ngocle_new
}
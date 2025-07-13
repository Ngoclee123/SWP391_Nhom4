package com.example.project.repository;

import com.example.project.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentRepository extends JpaRepository<Parent, Integer> {
    Parent findByAccountId(int accountId);
}

package com.example.project.repository;

import com.example.project.model.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Integer> {
    Optional<NotificationTemplate> findByName(String name);
} 
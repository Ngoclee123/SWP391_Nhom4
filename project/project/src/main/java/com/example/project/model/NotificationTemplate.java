package com.example.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "NotificationTemplates")
public class NotificationTemplate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_id")
    private Integer templateId;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "subject", nullable = false)
    private String subject;
    
    @Column(name = "body", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String body;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL)
    private List<Notification> notifications;
} 
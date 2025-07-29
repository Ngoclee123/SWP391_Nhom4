package com.example.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Notifications")
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Integer notificationId;
    
    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
    
    @ManyToOne
    @JoinColumn(name = "template_id")
    private NotificationTemplate template;
    
    @Column(name = "subject", nullable = false)
    private String subject;
    
    @Column(name = "body", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String body;
    
    @Column(name = "status", nullable = false)
    private String status = "Pending";
    
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;
    
    @Column(name = "notification_type", nullable = false)
    private String notificationType; // SYSTEM, APPOINTMENT, VACCINE, etc.
    
    @Column(name = "reference_id")
    private Integer referenceId; // ID of related entity (appointment, vaccine appointment, etc.)
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "sender_id")
    private Integer senderId; // ID of account that sent the notification (null for system notifications)
} 
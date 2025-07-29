package com.example.project.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDTO {
    private Integer notificationId;
    private Integer accountId;
    private String subject;
    private String body;
    private boolean isRead;
    private String notificationType;
    private Integer referenceId;
    private String status;
    private Integer senderId;
    private String senderName;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    // Additional fields for reference information
    private String patientName;
    private String vaccineName;
    private String appointmentDate;
} 
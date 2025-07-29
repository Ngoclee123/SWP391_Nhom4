package com.example.project.service;

import com.example.project.dto.NotificationDTO;
import com.example.project.model.Account;
import com.example.project.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    
    // Get notifications for a user
    List<NotificationDTO> getUserNotifications(Integer accountId);
    
    // Get paginated notifications
    Page<NotificationDTO> getUserNotificationsPaginated(Integer accountId, Pageable pageable);
    
    // Get unread notifications count
    long getUnreadNotificationsCount(Integer accountId);
    
    // Mark notification as read
    void markAsRead(Integer accountId, Integer notificationId);
    
    // Mark all notifications as read
    void markAllAsRead(Integer accountId);
    
    // Create a notification for a vaccine appointment
    NotificationDTO createVaccineAppointmentNotification(Integer vaccineAppointmentId);
    
    // Create and send a notification to a specific user
    NotificationDTO sendNotification(Integer senderAccountId, Integer receiverAccountId, String subject, String body, String notificationType, Integer referenceId);
    
    // Send notification to all users (admin only)
    List<NotificationDTO> sendNotificationToAll(Integer adminAccountId, String subject, String body);
    
    // Send notification to all users with specific role
    List<NotificationDTO> sendNotificationToRole(Integer senderAccountId, String role, String subject, String body);
    
    // Get notification by ID
    NotificationDTO getNotificationById(Integer notificationId);
    
    // Delete notification
    void deleteNotification(Integer notificationId);
    
    // Find notifications by type and reference ID
    List<Notification> findByTypeAndReferenceId(String type, Integer referenceId);
    
    // Get notifications for doctor
    List<NotificationDTO> getDoctorNotifications(String token);
    
    // Get unread notifications count for doctor
    long getDoctorUnreadNotificationsCount(Integer doctorAccountId);
    
    // Admin sends notification to all doctors
    List<NotificationDTO> sendNotificationToAllDoctors(Integer adminAccountId, String subject, String body);
    
    // Admin sends notification to specific doctor
    NotificationDTO sendNotificationToDoctor(Integer adminAccountId, Integer doctorAccountId, String subject, String body);
} 
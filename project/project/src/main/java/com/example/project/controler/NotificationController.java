package com.example.project.controler;

import com.example.project.dto.NotificationDTO;
import com.example.project.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Get user notifications
    @GetMapping("/{accountId}")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable Integer accountId) {
        List<NotificationDTO> notifications = notificationService.getUserNotifications(accountId);
        return ResponseEntity.ok(notifications);
    }

    // Get paginated user notifications
    @GetMapping("/{accountId}/paginated")
    public ResponseEntity<Page<NotificationDTO>> getUserNotificationsPaginated(
            @PathVariable Integer accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDTO> notifications = notificationService.getUserNotificationsPaginated(accountId, pageable);
        return ResponseEntity.ok(notifications);
    }

    // Get unread notifications count
    @GetMapping("/{accountId}/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadNotificationsCount(@PathVariable Integer accountId) {
        long count = notificationService.getUnreadNotificationsCount(accountId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    // Mark notification as read
    @PostMapping("/{accountId}/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Integer accountId, 
            @PathVariable Integer notificationId) {
        notificationService.markAsRead(accountId, notificationId);
        return ResponseEntity.ok().build();
    }

    // Mark all notifications as read
    @PostMapping("/{accountId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Integer accountId) {
        notificationService.markAllAsRead(accountId);
        return ResponseEntity.ok().build();
    }

    // Send notification to a user
    @PostMapping("/send")
    public ResponseEntity<NotificationDTO> sendNotification(
            @RequestParam Integer senderAccountId,
            @RequestParam Integer receiverAccountId,
            @RequestParam String subject,
            @RequestParam String body,
            @RequestParam String notificationType,
            @RequestParam(required = false) Integer referenceId) {
        NotificationDTO notification = notificationService.sendNotification(
                senderAccountId, receiverAccountId, subject, body, notificationType, referenceId);
        return ResponseEntity.ok(notification);
    }

    // Send notification to all users (admin only)
    @PostMapping("/send-all")
    public ResponseEntity<?> sendNotificationToAll(
            @RequestParam Integer adminAccountId,
            @RequestParam String subject,
            @RequestParam String body) {
        List<NotificationDTO> notifications = notificationService.sendNotificationToAll(adminAccountId, subject, body);
        Map<String, Object> response = new HashMap<>();
        response.put("sentCount", notifications.size());
        response.put("message", "Notifications sent successfully");
        return ResponseEntity.ok(response);
    }

    // Send notification to users with specific role
    @PostMapping("/send-role")
    public ResponseEntity<?> sendNotificationToRole(
            @RequestParam Integer senderAccountId,
            @RequestParam String role,
            @RequestParam String subject,
            @RequestParam String body) {
        List<NotificationDTO> notifications = notificationService.sendNotificationToRole(
                senderAccountId, role, subject, body);
        Map<String, Object> response = new HashMap<>();
        response.put("sentCount", notifications.size());
        response.put("message", "Notifications sent successfully");
        return ResponseEntity.ok(response);
    }

    // Get notification by ID
    @GetMapping("/detail/{notificationId}")
    public ResponseEntity<NotificationDTO> getNotificationById(@PathVariable Integer notificationId) {
        NotificationDTO notification = notificationService.getNotificationById(notificationId);
        return ResponseEntity.ok(notification);
    }

    // Delete notification
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Integer notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }

    // Create notification for vaccine appointment
    @PostMapping("/vaccine-appointment/{vaccineAppointmentId}")
    public ResponseEntity<NotificationDTO> createVaccineAppointmentNotification(
            @PathVariable Integer vaccineAppointmentId) {
        NotificationDTO notification = notificationService.createVaccineAppointmentNotification(vaccineAppointmentId);
        return ResponseEntity.ok(notification);
    }
} 
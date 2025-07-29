package com.example.project.controler;

import com.example.project.dto.NotificationDTO;
import com.example.project.service.NotificationService;
import com.example.project.config.JwtUtil;
import com.example.project.model.Account;
import com.example.project.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AccountRepository accountRepository;

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
            @RequestHeader("Authorization") String authHeader,
            @RequestParam Integer senderAccountId,
            @RequestParam Integer receiverAccountId,
            @RequestParam String subject,
            @RequestParam String body,
            @RequestParam String notificationType,
            @RequestParam(required = false) Integer referenceId) {
        String token = authHeader.replace("Bearer ", "");
        String role = jwtUtil.extractRole(token);
        Integer jwtAccountId = jwtUtil.extractAccountId(token);
        if (!jwtAccountId.equals(senderAccountId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sender ID mismatch with token");
        }
        if (role.equals("ADMIN")) {
            // Admin có thể gửi cho bất kỳ ai
        } else if (role.equals("DOCTOR")) {
            // Doctor chỉ gửi cho patient
            // TODO: kiểm tra receiver có phải patient không (cần AccountRepository)
            // Đơn giản: kiểm tra receiver role
            Account receiver = accountRepository.findById(receiverAccountId).orElse(null);
            if (receiver == null || !receiver.getRole().getRolename().equals("USER")) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Doctor chỉ gửi cho bệnh nhân");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ admin hoặc doctor được gửi thông báo");
        }
        NotificationDTO notification = notificationService.sendNotification(
                senderAccountId, receiverAccountId, subject, body, notificationType, referenceId);
        return ResponseEntity.ok(notification);
    }

    // Send notification to all users (admin only)
    @PostMapping("/send-all")
    public ResponseEntity<?> sendNotificationToAll(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam Integer adminAccountId,
            @RequestParam String subject,
            @RequestParam String body) {
        String token = authHeader.replace("Bearer ", "");
        String role = jwtUtil.extractRole(token);
        Integer jwtAccountId = jwtUtil.extractAccountId(token);
        if (!role.equals("ADMIN") || !jwtAccountId.equals(adminAccountId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ admin mới được gửi thông báo cho tất cả");
        }
        List<NotificationDTO> notifications = notificationService.sendNotificationToAll(adminAccountId, subject, body);
        Map<String, Object> response = new HashMap<>();
        response.put("sentCount", notifications.size());
        response.put("message", "Notifications sent successfully");
        return ResponseEntity.ok(response);
    }

    // Send notification to users with specific role
    @PostMapping("/send-role")
    public ResponseEntity<?> sendNotificationToRole(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam Integer senderAccountId,
            @RequestParam String role,
            @RequestParam String subject,
            @RequestParam String body) {
        String token = authHeader.replace("Bearer ", "");
        String jwtRole = jwtUtil.extractRole(token);
        Integer jwtAccountId = jwtUtil.extractAccountId(token);
        if (!jwtRole.equals("ADMIN") || !jwtAccountId.equals(senderAccountId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ admin mới được gửi thông báo theo role");
        }
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
    public ResponseEntity<Void> deleteNotification(@RequestHeader("Authorization") String authHeader, @PathVariable Integer notificationId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            Account account = accountRepository.findByUsername(username);
            
            if (account == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get doctor notifications
    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<NotificationDTO>> getDoctorNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            Account doctorAccount = accountRepository.findByUsername(username);
            
            if (doctorAccount == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            List<NotificationDTO> notifications = notificationService.getDoctorNotifications(token);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get doctor unread notifications count
    @GetMapping("/doctor/unread-count")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Long>> getDoctorUnreadCount(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            Account doctorAccount = accountRepository.findByUsername(username);
            
            if (doctorAccount == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            long count = notificationService.getDoctorUnreadNotificationsCount(doctorAccount.getId());
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Admin sends notification to all doctors
    @PostMapping("/admin/send-to-all-doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NotificationDTO>> sendNotificationToAllDoctors(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            Account adminAccount = accountRepository.findByUsername(username);
            
            if (adminAccount == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String subject = request.get("subject");
            String body = request.get("body");
            
            if (subject == null || body == null) {
                return ResponseEntity.badRequest().build();
            }
            
            List<NotificationDTO> notifications = notificationService.sendNotificationToAllDoctors(
                adminAccount.getId(), subject, body);
            
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Admin sends notification to specific doctor
    @PostMapping("/admin/send-to-doctor")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationDTO> sendNotificationToDoctor(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            Account adminAccount = accountRepository.findByUsername(username);
            
            if (adminAccount == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            Integer doctorAccountId = (Integer) request.get("doctorAccountId");
            String subject = (String) request.get("subject");
            String body = (String) request.get("body");
            
            if (doctorAccountId == null || subject == null || body == null) {
                return ResponseEntity.badRequest().build();
            }
            
            NotificationDTO notification = notificationService.sendNotificationToDoctor(
                adminAccount.getId(), doctorAccountId, subject, body);
            
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create notification for vaccine appointment
    @PostMapping("/vaccine-appointment/{vaccineAppointmentId}")
    public ResponseEntity<NotificationDTO> createVaccineAppointmentNotification(
            @PathVariable Integer vaccineAppointmentId) {
        NotificationDTO notification = notificationService.createVaccineAppointmentNotification(vaccineAppointmentId);
        return ResponseEntity.ok(notification);
    }
} 
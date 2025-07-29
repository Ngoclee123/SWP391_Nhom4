package com.example.project.service.impl;

import com.example.project.dto.NotificationDTO;
import com.example.project.model.*;
import com.example.project.repository.*;
import com.example.project.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.example.project.config.JwtUtil;

@Service
public class NotificationServiceImpl implements NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationTemplateRepository templateRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private VaccineAppointmentRepository vaccineAppointmentRepository;

    @Autowired
    private VaccineRepository vaccineRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private JwtUtil jwtUtil;


    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    /**
     * Helper method to get or create a default notification template
     */
    private NotificationTemplate getDefaultNotificationTemplate() {
        return templateRepository.findByName("DEFAULT")
            .orElseGet(() -> {
                NotificationTemplate template = new NotificationTemplate();
                template.setName("DEFAULT");
                template.setSubject("System Notification");
                template.setBody("Default notification template");
                template.setCreatedAt(LocalDateTime.now());
                return templateRepository.save(template);
            });
    }

    @Override
    public List<NotificationDTO> getUserNotifications(Integer accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return notificationRepository.findByAccountOrderByCreatedAtDesc(account).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<NotificationDTO> getUserNotificationsPaginated(Integer accountId, Pageable pageable) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return notificationRepository.findByAccountOrderByCreatedAtDesc(account, pageable)
                .map(this::convertToDTO);
    }

    @Override
    public long getUnreadNotificationsCount(Integer accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return notificationRepository.countByAccountAndIsReadFalse(account);
    }

    @Override
    @Transactional
    public void markAsRead(Integer accountId, Integer notificationId) {
        notificationRepository.markAsRead(accountId, notificationId);
    }

    @Override
    @Transactional
    public void markAllAsRead(Integer accountId) {
        notificationRepository.markAllAsRead(accountId);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NotificationDTO createVaccineAppointmentNotification(Integer vaccineAppointmentId) {
        logger.info("NOTIFICATION SERVICE: Creating vaccine appointment notification for ID: {}", vaccineAppointmentId);
        
        try {
            // Tìm lịch hẹn vaccine
            VaccineAppointment appointment = vaccineAppointmentRepository.findById(vaccineAppointmentId)
                    .orElseThrow(() -> new RuntimeException("Vaccine appointment not found with ID: " + vaccineAppointmentId));

            // Get admin accounts to notify
            List<Account> adminAccounts = accountRepository.findByRoleName("ADMIN");
            logger.info("NOTIFICATION SERVICE: Found {} admin accounts to notify", adminAccounts.size());
            
            if (adminAccounts.isEmpty()) {
                logger.warn("NOTIFICATION SERVICE: No admin accounts found to notify about vaccine appointment");
                throw new RuntimeException("No admin accounts found");
            }

            // Get vaccine and patient info
            Vaccine vaccine = appointment.getVaccine();
            Patient patient = appointment.getPatient();
            
            String appointmentDate = appointment.getAppointmentDate() != null 
                ? appointment.getAppointmentDate().format(DATE_FORMATTER)
                : "N/A";

            logger.info("Found appointment with patient: {}, vaccine: {}", 
                    patient.getFullName(), vaccine.getName());

            // Prepare notification content
            String subject = "Lịch hẹn tiêm vaccine mới";
            String body = String.format("Lịch hẹn mới: Bệnh nhân %s đã đặt lịch tiêm vaccine %s vào ngày %s.",
                    patient.getFullName(), vaccine.getName(), appointmentDate);
                    
            // Create and save a notification for each admin
            Notification notification = null;
            for (Account admin : adminAccounts) {
                try {
                    notification = new Notification();
                    notification.setAccount(admin);
                    notification.setSubject(subject);
                    notification.setBody(body);
                    notification.setNotificationType("VACCINE_APPOINTMENT");
                    notification.setReferenceId(appointment.getId());
                    notification.setStatus("Sent");
                    notification.setRead(false);
                    notification.setSentAt(LocalDateTime.now());
                    notification.setCreatedAt(LocalDateTime.now());
                    notification.setTemplate(getDefaultNotificationTemplate());
                    
                    notification = notificationRepository.save(notification);
                    logger.info("Created notification for admin {} with ID: {}", 
                        admin.getUsername(), notification.getNotificationId());
                } catch (Exception e) {
                    logger.error("Failed to create notification for admin {}: {}", 
                        admin.getUsername(), e.getMessage());
                }
            }

            // Return the last notification created
            if (notification != null) {
                NotificationDTO dto = new NotificationDTO();
                dto.setNotificationId(notification.getNotificationId());
                dto.setAccountId(notification.getAccount().getId());
                dto.setSubject(notification.getSubject());
                dto.setBody(notification.getBody());
                dto.setCreatedAt(notification.getCreatedAt());
                dto.setRead(notification.isRead());
                dto.setNotificationType("VACCINE_APPOINTMENT");
                dto.setReferenceId(vaccineAppointmentId);
                dto.setStatus("Sent");
                
                // Additional reference fields
                dto.setPatientName(patient.getFullName());
                dto.setVaccineName(vaccine.getName());
                dto.setAppointmentDate(appointmentDate);
                
                return dto;
            } else {
                logger.error("Failed to create any notifications for vaccine appointment ID: {}", vaccineAppointmentId);
                throw new RuntimeException("Failed to create notification");
            }
        } catch (Exception e) {
            logger.error("Error creating vaccine appointment notification: {}", e.getMessage(), e);
            throw new RuntimeException("Error creating notification: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public NotificationDTO sendNotification(Integer senderAccountId, Integer receiverAccountId, 
                                          String subject, String body, 
                                          String notificationType, Integer referenceId) {
        // Get sender and receiver accounts
        Account sender = accountRepository.findById(senderAccountId)
                .orElseThrow(() -> new RuntimeException("Sender account not found"));
        
        Account receiver = accountRepository.findById(receiverAccountId)
                .orElseThrow(() -> new RuntimeException("Receiver account not found"));

        // Create and save notification
        Notification notification = new Notification();
        notification.setAccount(receiver);
        notification.setSubject(subject);
        notification.setBody(body);
        notification.setNotificationType(notificationType);
        notification.setReferenceId(referenceId);
        notification.setStatus("Sent");
        notification.setSentAt(LocalDateTime.now());
        notification.setSenderId(senderAccountId);
        notification.setTemplate(getDefaultNotificationTemplate());

        Notification saved = notificationRepository.save(notification);
        NotificationDTO dto = convertToDTO(saved);
        dto.setSenderName(sender.getFullName());
        return dto;
    }

    @Override
    @Transactional
    public List<NotificationDTO> sendNotificationToAll(Integer adminAccountId, String subject, String body) {
        // Verify sender is admin
        Account admin = accountRepository.findById(adminAccountId)
                .orElseThrow(() -> new RuntimeException("Admin account not found"));
        
        if (!admin.getRole().getRolename().equals("ADMIN")) {
            throw new RuntimeException("Only administrators can send notifications to all users");
        }

        // Get all active accounts
        List<Account> allAccounts = accountRepository.findAll();
        List<NotificationDTO> sentNotifications = new ArrayList<>();

        // Send to each account
        for (Account account : allAccounts) {
            if (account.getId().equals(adminAccountId)) {
                continue; // Skip sending to self
            }
            
            Notification notification = new Notification();
            notification.setAccount(account);
            notification.setSubject(subject);
            notification.setBody(body);
            notification.setNotificationType("SYSTEM");
            notification.setStatus("Sent");
            notification.setSentAt(LocalDateTime.now());
            notification.setSenderId(adminAccountId);
            notification.setTemplate(getDefaultNotificationTemplate());

            Notification saved = notificationRepository.save(notification);
            NotificationDTO dto = convertToDTO(saved);
            dto.setSenderName(admin.getFullName());
            sentNotifications.add(dto);
        }

        return sentNotifications;
    }

    @Override
    @Transactional
    public List<NotificationDTO> sendNotificationToRole(Integer senderAccountId, String role, 
                                                      String subject, String body) {
        // Verify sender
        Account sender = accountRepository.findById(senderAccountId)
                .orElseThrow(() -> new RuntimeException("Sender account not found"));
        
        // Get all accounts with specified role
        List<Account> accounts = accountRepository.findByRoleName(role);
        List<NotificationDTO> sentNotifications = new ArrayList<>();

        // Send to each account
        for (Account account : accounts) {
            if (account.getId().equals(senderAccountId)) {
                continue; // Skip sending to self
            }
            
            Notification notification = new Notification();
            notification.setAccount(account);
            notification.setSubject(subject);
            notification.setBody(body);
            notification.setNotificationType("ROLE_BASED");
            notification.setStatus("Sent");
            notification.setSentAt(LocalDateTime.now());
            notification.setSenderId(senderAccountId);
            notification.setTemplate(getDefaultNotificationTemplate());

            Notification saved = notificationRepository.save(notification);
            NotificationDTO dto = convertToDTO(saved);
            dto.setSenderName(sender.getFullName());
            sentNotifications.add(dto);
        }

        return sentNotifications;
    }

    @Override
    public NotificationDTO getNotificationById(Integer notificationId) {
        return convertToDTO(notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found")));
    }

    @Override
    public void deleteNotification(Integer notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Override
    public List<Notification> findByTypeAndReferenceId(String type, Integer referenceId) {
        return notificationRepository.findByNotificationTypeAndReferenceId(type, referenceId);
    }

    @Override
    public List<NotificationDTO> getDoctorNotifications(String token) {
        try {
            Integer doctorId = jwtUtil.extractAccountId(token);
            Account doctor = accountRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor account not found"));
            List<Notification> notifications = notificationRepository.findByAccountOrderByCreatedAtDesc(doctor);
            return notifications.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error getting doctor notifications: {}", e.getMessage(), e);
            throw new RuntimeException("Error getting notifications: " + e.getMessage(), e);
        }
    }

    @Override
    public long getDoctorUnreadNotificationsCount(Integer doctorAccountId) {
        try {
            Account doctor = accountRepository.findById(doctorAccountId)
                    .orElseThrow(() -> new RuntimeException("Doctor account not found"));

            return notificationRepository.countByAccountAndIsReadFalse(doctor);
        } catch (Exception e) {
            logger.error("Error getting doctor unread count: {}", e.getMessage(), e);
            return 0;
        }
    }

    @Override
    @Transactional
    public List<NotificationDTO> sendNotificationToAllDoctors(Integer adminAccountId, String subject, String body) {
        try {
            // Get admin account
            Account admin = accountRepository.findById(adminAccountId)
                    .orElseThrow(() -> new RuntimeException("Admin account not found"));

            // Get all doctor accounts
            List<Account> doctorAccounts = accountRepository.findByRoleName("DOCTOR");
            logger.info("Sending notification to {} doctors", doctorAccounts.size());

            List<NotificationDTO> sentNotifications = new ArrayList<>();
            for (Account doctor : doctorAccounts) {
                try {
                    Notification notification = new Notification();
                    notification.setAccount(doctor);
                    notification.setSubject(subject);
                    notification.setBody(body);
                    notification.setNotificationType("ADMIN_TO_DOCTOR");
                    notification.setStatus("Sent");
                    notification.setRead(false);
                    notification.setSentAt(LocalDateTime.now());
                    notification.setCreatedAt(LocalDateTime.now());
                    notification.setSenderId(adminAccountId);
                    notification.setTemplate(getDefaultNotificationTemplate());

                    notification = notificationRepository.save(notification);
                    sentNotifications.add(convertToDTO(notification));
                    logger.info("Sent notification to doctor {} with ID: {}", 
                        doctor.getUsername(), notification.getNotificationId());
                } catch (Exception e) {
                    logger.error("Failed to send notification to doctor {}: {}", 
                        doctor.getUsername(), e.getMessage());
                }
            }

            return sentNotifications;
        } catch (Exception e) {
            logger.error("Error sending notification to all doctors: {}", e.getMessage(), e);
            throw new RuntimeException("Error sending notifications: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public NotificationDTO sendNotificationToDoctor(Integer adminAccountId, Integer doctorAccountId, String subject, String body) {
        try {
            // Get admin and doctor accounts
            Account admin = accountRepository.findById(adminAccountId)
                    .orElseThrow(() -> new RuntimeException("Admin account not found"));
            Account doctor = accountRepository.findById(doctorAccountId)
                    .orElseThrow(() -> new RuntimeException("Doctor account not found"));

            // Create notification
            Notification notification = new Notification();
            notification.setAccount(doctor);
            notification.setSubject(subject);
            notification.setBody(body);
            notification.setNotificationType("ADMIN_TO_DOCTOR");
            notification.setStatus("Sent");
            notification.setRead(false);
            notification.setSentAt(LocalDateTime.now());
            notification.setCreatedAt(LocalDateTime.now());
            notification.setSenderId(adminAccountId);
            notification.setTemplate(getDefaultNotificationTemplate());

            notification = notificationRepository.save(notification);
            logger.info("Admin {} sent notification to doctor {} with ID: {}", 
                admin.getUsername(), doctor.getUsername(), notification.getNotificationId());

            return convertToDTO(notification);
        } catch (Exception e) {
            logger.error("Error sending notification from admin to doctor: {}", e.getMessage(), e);
            throw new RuntimeException("Error sending notification: " + e.getMessage(), e);
        }
    }

    /**
     * Tự động xóa thông báo cũ sau 1 ngày
     * Chạy mỗi ngày lúc 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void deleteOldNotifications() {
        try {
            LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
            logger.info("Deleting notifications older than: {}", oneDayAgo);
            
            List<Notification> oldNotifications = notificationRepository.findByCreatedAtBefore(oneDayAgo);
            int deletedCount = oldNotifications.size();
            
            if (deletedCount > 0) {
                notificationRepository.deleteAll(oldNotifications);
                logger.info("Successfully deleted {} old notifications", deletedCount);
            } else {
                logger.info("No old notifications to delete");
            }
        } catch (Exception e) {
            logger.error("Error deleting old notifications: {}", e.getMessage(), e);
        }
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setNotificationId(notification.getNotificationId());
        dto.setAccountId(notification.getAccount().getId());
        dto.setSubject(notification.getSubject());
        dto.setBody(notification.getBody());
        dto.setRead(notification.isRead());
        dto.setNotificationType(notification.getNotificationType());
        dto.setReferenceId(notification.getReferenceId());
        dto.setStatus(notification.getStatus());
        dto.setSenderId(notification.getSenderId());
        dto.setCreatedAt(notification.getCreatedAt());
        
        // Add sender name if senderId exists
        if (notification.getSenderId() != null) {
            try {
                Account sender = accountRepository.findById(notification.getSenderId()).orElse(null);
                if (sender != null) {
                    dto.setSenderName(sender.getFullName() != null ? sender.getFullName() : sender.getUsername());
                }
            } catch (Exception e) {
                logger.warn("Could not fetch sender name for notification {}: {}", notification.getNotificationId(), e.getMessage());
            }
        }
        
        // If it's a vaccine appointment notification, add additional info
        if ("VACCINE_APPOINTMENT".equals(notification.getNotificationType()) && notification.getReferenceId() != null) {
            vaccineAppointmentRepository.findById(notification.getReferenceId()).ifPresent(appointment -> {
                dto.setPatientName(appointment.getPatient().getFullName());
                dto.setVaccineName(appointment.getVaccine().getName());
                if (appointment.getAppointmentDate() != null) {
                    dto.setAppointmentDate(appointment.getAppointmentDate().format(DATE_FORMATTER));
                }
            });
        }
        
        return dto;
    }
} 
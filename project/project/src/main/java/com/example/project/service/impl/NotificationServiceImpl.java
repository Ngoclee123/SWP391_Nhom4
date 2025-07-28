package com.example.project.service.impl;

import com.example.project.dto.NotificationDTO;
import com.example.project.model.*;
import com.example.project.repository.*;
import com.example.project.service.NotificationService;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

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
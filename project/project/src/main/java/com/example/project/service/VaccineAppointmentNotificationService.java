package com.example.project.service;

import com.example.project.event.VaccineAppointmentCreatedEvent;
import com.example.project.model.VaccineAppointment;
import com.example.project.repository.VaccineAppointmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Optional;

@Service
public class VaccineAppointmentNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(VaccineAppointmentNotificationService.class);
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private VaccineAppointmentRepository vaccineAppointmentRepository;
    
    @Async("notificationTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleVaccineAppointmentCreatedEvent(VaccineAppointmentCreatedEvent event) {
        try {
            Integer appointmentId = event.getAppointmentId();
            logger.info("Handling vaccine appointment created event for ID: {}", appointmentId);
            
            // Gửi thông báo
            notificationService.createVaccineAppointmentNotification(appointmentId);
            
            logger.info("Successfully sent notification for appointment ID: {}", appointmentId);
        } catch (Exception e) {
            logger.error("Error sending notification for appointment: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Phương thức này được gọi sau khi lịch hẹn được lưu thành công
     */
    public void sendNotificationForNewAppointment(Integer appointmentId) {
        try {
            logger.info("Manually sending notification for appointment ID: {}", appointmentId);
            
            // Gọi trực tiếp service
            notificationService.createVaccineAppointmentNotification(appointmentId);
            
            logger.info("Successfully requested notification for appointment ID: {}", appointmentId);
        } catch (Exception e) {
            logger.error("Error requesting notification for appointment ID {}: {}", 
                    appointmentId, e.getMessage(), e);
        }
    }
} 
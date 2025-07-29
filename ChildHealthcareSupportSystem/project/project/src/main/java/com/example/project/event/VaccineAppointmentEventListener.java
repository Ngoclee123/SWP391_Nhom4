package com.example.project.event;

import com.example.project.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class VaccineAppointmentEventListener {

    private static final Logger logger = LoggerFactory.getLogger(VaccineAppointmentEventListener.class);
    
    @Autowired
    private NotificationService notificationService;
    
    @Async("notificationTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleVaccineAppointmentCreatedEvent(VaccineAppointmentCreatedEvent event) {
        try {
            logger.info("EVENT LISTENER: Received vaccine appointment created event for appointment ID: {}", event.getAppointmentId());
            notificationService.createVaccineAppointmentNotification(event.getAppointmentId());
            logger.info("EVENT LISTENER: Successfully created notification for appointment ID: {}", event.getAppointmentId());
        } catch (Exception e) {
            logger.error("EVENT LISTENER: Error processing vaccine appointment notification: {}", e.getMessage(), e);
        }
    }
} 
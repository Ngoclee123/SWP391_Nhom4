package com.example.project.controler.vacin;

import com.example.project.service.VaccineAppointmentService;
import com.example.project.service.VaccineAppointmentNotificationService;
import com.example.project.model.VaccineAppointment;
import com.example.project.dto.VaccineAppointmentHistoryDTO;
import com.example.project.dto.VaccineAppointmentDTO;
import com.example.project.dto.VaccineStatisticsDTO;
import com.example.project.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/vaccine-appointments")
public class VaccineAppointmentController {

    private static final Logger logger = LoggerFactory.getLogger(VaccineAppointmentController.class);

    @Autowired
    private VaccineAppointmentService vaccineAppointmentService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private VaccineAppointmentNotificationService vaccineAppointmentNotificationService;

    @GetMapping("/availability/{vaccineId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getVaccineAvailability(@PathVariable Integer vaccineId) {
        return vaccineAppointmentService.getVaccineAvailability(vaccineId);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createAppointment(@RequestBody VaccineAppointmentRequest appointmentData, Authentication authentication) {
        // Ghi log trước khi tạo lịch hẹn
        logger.debug("Creating vaccine appointment with data: {}", appointmentData);
        
        // Tạo lịch hẹn
        ResponseEntity<?> response = vaccineAppointmentService.createAppointment(appointmentData, authentication);
        
        // Ghi log kết quả
        logger.debug("Vaccine appointment creation response: {}", response.getBody());
        
        // Nếu tạo lịch hẹn thành công, gửi thông báo
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            try {
                // Chuyển đổi body về Map để truy cập các thuộc tính
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
                
                // Thử cả hai key có thể có
                Integer appointmentId = null;
                if (responseBody.containsKey("vaccineAppointmentId")) {
                    appointmentId = (Integer) responseBody.get("vaccineAppointmentId");
                    logger.debug("Found vaccineAppointmentId: {}", appointmentId);
                } else if (responseBody.containsKey("id")) {
                    appointmentId = (Integer) responseBody.get("id");
                    logger.debug("Found id: {}", appointmentId);
                } else if (responseBody.containsKey("data")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                    if (data.containsKey("appointmentId")) {
                        appointmentId = (Integer) data.get("appointmentId");
                        logger.debug("Found appointmentId in data: {}", appointmentId);
                    }
                }

                if (appointmentId != null) {
                    // Sử dụng service mới để gửi thông báo
                    logger.info("Sending notification for new vaccine appointment ID: {}", appointmentId);
                    vaccineAppointmentNotificationService.sendNotificationForNewAppointment(appointmentId);
                } else {
                    logger.warn("Could not find appointmentId in response: {}", responseBody);
                }
            } catch (Exception e) {
                logger.error("Error sending notification: {}", e.getMessage(), e);
            }
        }
        
        return response;
    }

    @GetMapping("/{vaccineAppointmentId}/payment")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getPaymentDetails(@PathVariable Integer vaccineAppointmentId) {
        return vaccineAppointmentService.getPaymentDetails(vaccineAppointmentId);
    }

    @PostMapping("/{vaccineAppointmentId}/refund")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> requestRefund(@PathVariable Integer vaccineAppointmentId) {
        return vaccineAppointmentService.requestRefund(vaccineAppointmentId);
    }

    @PostMapping("/{id}/cancel-request")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> requestCancel(@PathVariable Integer id) {
        return vaccineAppointmentService.requestCancelAppointment(id);
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<VaccineAppointmentHistoryDTO>> getHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        String username = authentication.getName();
        Page<VaccineAppointmentHistoryDTO> historyPage = vaccineAppointmentService.getHistoryByUsername(username, PageRequest.of(page, size));
        return ResponseEntity.ok(historyPage);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<VaccineAppointmentDTO>> getAllAppointments(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(vaccineAppointmentService.getAllAppointments(PageRequest.of(page, size)));
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        boolean ok = vaccineAppointmentService.updateAppointmentStatusOnlyStatus(id, status);
        if (!ok) return ResponseEntity.notFound().build();
        
        // Send notification to patient about status change
        try {
            Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentService.getAppointmentById(id);
            appointmentOpt.ifPresent(appointment -> {
                if (appointment.getParent() != null && appointment.getParent().getAccount() != null) {
                    Integer parentAccountId = appointment.getParent().getAccount().getId();
                    String subject = "Vaccine Appointment Status Updated";
                    String message = "Your vaccine appointment status has been updated to: " + status;
                    notificationService.sendNotification(
                        null, // System notification
                        parentAccountId,
                        subject,
                        message,
                        "STATUS_UPDATE",
                        id
                    );
                    logger.info("Status update notification sent to parent account: {}", parentAccountId);
                }
            });
        } catch (Exception e) {
            logger.error("Error sending status update notification: {}", e.getMessage());
        }
        
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/{id}/status-flow")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminUpdateStatusFlow(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        ResponseEntity<?> response = vaccineAppointmentService.adminUpdateStatus(id, status);
        
        // If status update was successful, send notification to patient
        if (response.getStatusCode().is2xxSuccessful()) {
            try {
                Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentService.getAppointmentById(id);
                appointmentOpt.ifPresent(appointment -> {
                    if (appointment.getParent() != null && appointment.getParent().getAccount() != null) {
                        Integer parentAccountId = appointment.getParent().getAccount().getId();
                        String subject = "Vaccine Appointment Status Updated";
                        String message = "Your vaccine appointment status has been updated to: " + status;
                        notificationService.sendNotification(
                            null, // System notification
                            parentAccountId,
                            subject,
                            message,
                            "STATUS_UPDATE",
                            id
                        );
                        logger.info("Status flow update notification sent to parent account: {}", parentAccountId);
                    }
                });
            } catch (Exception e) {
                logger.error("Error sending status flow update notification: {}", e.getMessage());
            }
        }
        
        return response;
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Integer id) {
        boolean deleted = vaccineAppointmentService.deleteAppointment(id);
        if (!deleted) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VaccineStatisticsDTO> getVaccineStatistics(@RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(vaccineAppointmentService.getVaccineStatistics(month, year));
    }
}
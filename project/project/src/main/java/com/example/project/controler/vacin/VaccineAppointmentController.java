<<<<<<< HEAD
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
=======
package com.example.project.controler.vacin;

import com.example.project.model.*;
import com.example.project.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vaccine-appointments")
public class VaccineAppointmentController {

    private static final Logger logger = LoggerFactory.getLogger(VaccineAppointmentController.class);

    @Autowired
    private VaccineAppointmentRepository vaccineAppointmentRepository;

    @Autowired
    private VaccineAvailabilityRepository vaccineAvailabilityRepository;

    @Autowired
    private VaccineRepository vaccineRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RefundRepository refundRepository;

    @GetMapping("/availability/{vaccineId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getVaccineAvailability(@PathVariable Integer vaccineId) {
        try {
            List<VaccineAvailability> availability = vaccineAvailabilityRepository.findByVaccine_vaccin_id(vaccineId);
            List<Map<String, Object>> availableSlots = availability.stream()
                    .filter(va -> va.getCapacity() > 0)
                    .map(va -> {
                        Map<String, Object> slot = new HashMap<>();
                        slot.put("available_date", va.getAvailableDate().toString());
                        slot.put("location", va.getLocation());
                        return slot;
                    })
                    .collect(Collectors.toList());
            Map<String, List<Map<String, Object>>> response = new HashMap<>();
            response.put("data", availableSlots);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching vaccine availability: {}", e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> createAppointment(@RequestBody VaccineAppointmentRequest appointmentData) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Integer patientId = appointmentData.getPatientId();
                Integer vaccineId = appointmentData.getVaccineId();
                String appointmentDateStr = appointmentData.getAppointmentDate();
                String location = appointmentData.getLocation();
                String notes = appointmentData.getNotes();
                Integer doseNumber = appointmentData.getDoseNumber();

                Instant appointmentDate = Instant.parse(appointmentDateStr + "T00:00:00Z");

                Patient patient = patientRepository.findById(patientId)
                        .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
                Vaccine vaccine = vaccineRepository.findById(vaccineId)
                        .orElseThrow(() -> new IllegalArgumentException("Vaccine not found"));

                VaccineAvailability availability = vaccineAvailabilityRepository.findByVaccine_vaccin_idAndAvailableDateAndLocation(
                        vaccineId, appointmentDate, location);

                if (availability == null || availability.getCapacity() <= 0) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Ngày giờ hoặc địa điểm không khả dụng."));
                }

                VaccineAppointment appointment = new VaccineAppointment();
                appointment.setPatient(patient);
                appointment.setVaccine(vaccine);
                appointment.setAppointmentDate(appointmentDate);
                appointment.setDoseNumber(doseNumber != null ? doseNumber : 1);
                appointment.setLocation(location);
                appointment.setStatus("Pending");
                appointment.setNotes(notes);
                appointment.setCreatedAt(Instant.now());

                vaccineAppointmentRepository.save(appointment);

                availability.setCapacity(availability.getCapacity() - 1);
                vaccineAvailabilityRepository.save(availability);

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Đặt lịch thành công!");
                response.put("vaccineAppointmentId", appointment.getId());
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                logger.error("Error creating appointment: {}", e.getMessage());
                return ResponseEntity.status(500).body(Map.of("message", "Đặt lịch thất bại. Vui lòng thử lại."));
            }
        });
    }

    @GetMapping("/{vaccineAppointmentId}/payment")
    @PreAuthorize("hasRole('USER')")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> getPaymentDetails(@PathVariable Integer vaccineAppointmentId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                VaccineAppointment appointment = vaccineAppointmentRepository.findById(vaccineAppointmentId)
                        .orElseThrow(() -> new IllegalArgumentException("Vaccine appointment not found"));
                Payment payment = paymentRepository.findByVaccineAppointmentId(vaccineAppointmentId)
                        .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

                Map<String, Object> response = new HashMap<>();
                response.put("amount", payment.getAmount());
                response.put("status", payment.getStatus());
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                logger.error("Error fetching payment details: {}", e.getMessage());
                return ResponseEntity.status(400).body(null);
            }
        });
    }

    @PostMapping("/{vaccineAppointmentId}/refund")
    @PreAuthorize("hasRole('USER')")
    public CompletableFuture<ResponseEntity<String>> requestRefund(@PathVariable Integer vaccineAppointmentId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Payment payment = paymentRepository.findByVaccineAppointmentId(vaccineAppointmentId)
                        .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

                if (!"Completed".equals(payment.getStatus())) {
                    return ResponseEntity.badRequest().body("Không thể yêu cầu hoàn tiền cho lịch hẹn này.");
                }

                Refund refund = new Refund();
                refund.setPayment(payment);
                refund.setAmount(payment.getAmount());
                refund.setReason("Yêu cầu hoàn tiền từ khách hàng");
                refund.setStatus("Pending");
                refundRepository.save(refund);

                return ResponseEntity.ok("Yêu cầu hoàn tiền đã được gửi thành công.");
            } catch (Exception e) {
                logger.error("Error requesting refund: {}", e.getMessage());
                return ResponseEntity.status(500).body("Lỗi khi yêu cầu hoàn tiền.");
            }
        });
    }
}
>>>>>>> ngocle_new

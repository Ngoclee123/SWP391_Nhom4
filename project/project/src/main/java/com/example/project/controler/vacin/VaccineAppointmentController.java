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

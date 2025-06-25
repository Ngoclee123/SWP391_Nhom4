package com.example.project.service;

import com.example.project.controler.vacin.VaccineAppointmentRequest;
import com.example.project.model.*;
import com.example.project.repository.VaccineAppointmentRepository;
import com.example.project.repository.VaccineAvailabilityRepository;
import com.example.project.repository.VaccineRepository;
import com.example.project.repository.PaymentRepository;
import com.example.project.repository.RefundRepository;
import com.example.project.repository.PatientRepository;
import com.example.project.repository.AccountRepository;
import com.example.project.dto.VaccineAppointmentHistoryDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@EnableAsync
public class VaccineAppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(VaccineAppointmentService.class);

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

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    @Qualifier("securityTaskExecutor")
    private TaskExecutor taskExecutor;

    public ResponseEntity<Map<String, List<Map<String, Object>>>> getVaccineAvailability(Integer vaccineId) {
        try {
            logger.debug("Fetching availability for vaccineId: {}", vaccineId);
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
            logger.error("Error in getVaccineAvailability: {}", e.getMessage());
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<Map<String, Object>> createAppointment(VaccineAppointmentRequest appointmentData) {
        try {
            logger.debug("Creating appointment with data: {}", appointmentData);
            if (appointmentData == null || appointmentData.getVaccineId() == null || appointmentData.getPatientId() == null ||
                    appointmentData.getAppointmentDate() == null || appointmentData.getLocation() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Dữ liệu không hợp lệ."));
            }
            Integer patientId = appointmentData.getPatientId();
            Integer vaccineId = appointmentData.getVaccineId();
            String appointmentDateStr = appointmentData.getAppointmentDate();
            logger.debug("Received appointmentDateStr: {}", appointmentDateStr);
            String location = appointmentData.getLocation();
            String notes = appointmentData.getNotes();
            Integer doseNumber = appointmentData.getDoseNumber();
            Instant appointmentDate;
            try {
                logger.debug("Parsing appointmentDate: {}", appointmentDateStr);
                appointmentDate = Instant.parse(appointmentDateStr);
                logger.debug("Parsed appointmentDate: {}", appointmentDate.toString());
            } catch (Exception e) {
                logger.error("Invalid appointmentDate format: {}", appointmentDateStr, e);
                return ResponseEntity.badRequest().body(Map.of("message", "Định dạng ngày không hợp lệ: " + e.getMessage()));
            }
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
            response.put("data", Map.of(
                "vaccineName", vaccine.getName(),
                "price", vaccine.getPrice(),
                "location", location,
                "appointmentDate", appointmentDate.toString()
            ));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Validation error in createAppointment: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (SecurityException e) {
            logger.error("Security error in createAppointment: {}", e.getMessage());
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized: No authenticated user."));
        } catch (Exception e) {
            logger.error("Error in createAppointment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("message", "Đặt lịch thất bại. Vui lòng thử lại."));
        }
    }

    public ResponseEntity<Map<String, Object>> getPaymentDetails(Integer vaccineAppointmentId) {
        try {
            logger.debug("Fetching payment details for vaccineAppointmentId: {}", vaccineAppointmentId);
            VaccineAppointment appointment = vaccineAppointmentRepository.findById(vaccineAppointmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Vaccine appointment not found"));
            Payment payment = paymentRepository.findByVaccineAppointmentId(vaccineAppointmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
            Map<String, Object> response = new HashMap<>();
            response.put("amount", payment.getAmount());
            response.put("status", payment.getStatus());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Validation error in getPaymentDetails: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error in getPaymentDetails: {}", e.getMessage(), e);
            return ResponseEntity.status(400).body(null);
        }
    }

    public ResponseEntity<String> requestRefund(Integer vaccineAppointmentId) {
        try {
            logger.debug("Requesting refund for vaccineAppointmentId: {}", vaccineAppointmentId);
            Payment payment = paymentRepository.findByVaccineAppointmentId(vaccineAppointmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
            if (!"Completed".equals(payment.getStatus())) {
                return ResponseEntity.badRequest().body("Không thể yêu cầu hoàn tiền cho lịch hẹn này.");
            }
            Refund refund = new Refund();
            refund.setPayment(payment);
            refund.setCreatedAt(Instant.now());
            refundRepository.save(refund);
            payment.setStatus("RefundRequested");
            paymentRepository.save(payment);
            return ResponseEntity.ok("Yêu cầu hoàn tiền đã được gửi thành công.");
        } catch (IllegalArgumentException e) {
            logger.error("Validation error in requestRefund: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error in requestRefund: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Lỗi khi yêu cầu hoàn tiền: " + e.getMessage());
        }
    }

    public Payment createPayment(Integer vaccineAppointmentId, String paymentMethod) {
        logger.debug("Creating payment for vaccineAppointmentId: {}", vaccineAppointmentId);
        Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentRepository.findById(vaccineAppointmentId);
        if (!appointmentOpt.isPresent()) {
            throw new RuntimeException("Vaccine appointment not found");
        }
        VaccineAppointment appointment = appointmentOpt.get();
        Payment payment = new Payment();
        payment.setPatient(appointment.getPatient());
        payment.setVaccineAppointment(appointment);
        payment.setAmount(calculateTotalFee(appointment));
        payment.setPaymentMethod(paymentMethod);
        payment.setStatus("Pending");
        payment.setPaymentDate(Instant.now());
        return paymentRepository.save(payment);
    }

    public BigDecimal calculateTotalFee(VaccineAppointment appointment) {
        Vaccine vaccine = appointment.getVaccine();
        if (vaccine != null && vaccine.getPrice() != null) {
            return vaccine.getPrice();
        }
        return BigDecimal.valueOf(100000.0);
    }

    @Async("securityTaskExecutor")
    public CompletableFuture<VaccineAppointment> createVaccineAppointment(VaccineAppointmentRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            logger.debug("SecurityContext in async thread: {}", getAuthenticationInfo());
            try {
                logger.debug("Creating vaccine appointment with data: {}", request);
                VaccineAppointment appointment = new VaccineAppointment();

                Optional<Patient> patient = patientRepository.findById(request.getPatientId());
                if (!patient.isPresent()) {
                    throw new RuntimeException("Patient not found");
                }
                Integer parentId = getCurrentParentId();
                if (!patient.get().getParent().getId().equals(parentId)) {
                    throw new RuntimeException("Unauthorized: Patient does not belong to this parent");
                }
                appointment.setPatient(patient.get());

                Optional<Vaccine> vaccine = vaccineRepository.findById(request.getVaccineId());
                if (!vaccine.isPresent()) {
                    throw new RuntimeException("Vaccine not found");
                }
                appointment.setVaccine(vaccine.get());

                appointment.setAppointmentDate(Instant.parse(request.getAppointmentDate()));
                appointment.setDoseNumber(request.getDoseNumber() != null ? request.getDoseNumber() : 1);
                appointment.setLocation(request.getLocation());
                appointment.setNotes(request.getNotes());
                appointment.setStatus("Pending");
                appointment.setCreatedAt(Instant.now());

                return vaccineAppointmentRepository.save(appointment);
            } catch (Exception e) {
                logger.error("Error in createVaccineAppointment: {}", e.getMessage(), e);
                throw e;
            }
        }, taskExecutor);
    }

    @Async("securityTaskExecutor")
    public CompletableFuture<List<VaccineAppointment>> getAppointmentsByPatient(Integer patientId) {
        return CompletableFuture.supplyAsync(() -> {
            logger.debug("SecurityContext in async thread: {}", getAuthenticationInfo());
            try {
                logger.debug("Fetching appointments for patientId: {}", patientId);
                Integer parentId = getCurrentParentId();
                Optional<Patient> patient = patientRepository.findById(patientId);
                if (!patient.isPresent() || !patient.get().getParent().getId().equals(parentId)) {
                    throw new RuntimeException("Unauthorized: Patient does not belong to this parent");
                }
                return vaccineAppointmentRepository.findByPatientId(patientId);
            } catch (Exception e) {
                logger.error("Error in getAppointmentsByPatient: {}", e.getMessage(), e);
                throw e;
            }
        }, taskExecutor);
    }

    @Async("securityTaskExecutor")
    public CompletableFuture<VaccineAppointment> cancelVaccineAppointment(Integer id) {
        return CompletableFuture.supplyAsync(() -> {
            logger.debug("SecurityContext in async thread: {}", getAuthenticationInfo());
            try {
                logger.debug("Cancelling appointment with id: {}", id);
                Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentRepository.findById(id);
                if (!appointmentOpt.isPresent()) {
                    throw new RuntimeException("Vaccine appointment not found");
                }
                VaccineAppointment appointment = appointmentOpt.get();
                Integer parentId = getCurrentParentId();
                if (!appointment.getPatient().getParent().getId().equals(parentId)) {
                    throw new RuntimeException("Unauthorized: Cannot cancel this appointment");
                }
                appointment.setStatus("Cancelled");
                return vaccineAppointmentRepository.save(appointment);
            } catch (Exception e) {
                logger.error("Error in cancelVaccineAppointment: {}", e.getMessage(), e);
                throw e;
            }
        }, taskExecutor);
    }

    @Async("securityTaskExecutor")
    public CompletableFuture<VaccineAppointment> confirmVaccineAppointment(Integer id) {
        return CompletableFuture.supplyAsync(() -> {
            logger.debug("SecurityContext in async thread: {}", getAuthenticationInfo());
            try {
                logger.debug("Confirming appointment with id: {}", id);
                Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentRepository.findById(id);
                if (!appointmentOpt.isPresent()) {
                    throw new RuntimeException("Vaccine appointment not found");
                }
                VaccineAppointment appointment = appointmentOpt.get();
                appointment.setStatus("Confirmed");
                return vaccineAppointmentRepository.save(appointment);
            } catch (Exception e) {
                logger.error("Error in confirmVaccineAppointment: {}", e.getMessage(), e);
                throw e;
            }
        }, taskExecutor);
    }

    @Async("securityTaskExecutor")
    public CompletableFuture<List<VaccineAppointment>> getAllVaccineAppointments() {
        return CompletableFuture.supplyAsync(() -> {
            logger.debug("SecurityContext in async thread: {}", getAuthenticationInfo());
            try {
                logger.debug("Fetching all vaccine appointments");
                return vaccineAppointmentRepository.findAll();
            } catch (Exception e) {
                logger.error("Error in getAllVaccineAppointments: {}", e.getMessage(), e);
                throw e;
            }
        }, taskExecutor);
    }

    public Payment getPaymentByVaccineAppointmentId(Integer vaccineAppointmentId) {
        logger.debug("Fetching payment for vaccineAppointmentId: {}", vaccineAppointmentId);
        Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentRepository.findById(vaccineAppointmentId);
        if (!appointmentOpt.isPresent()) {
            throw new RuntimeException("Vaccine appointment not found");
        }
        return paymentRepository.findByVaccineAppointmentId(vaccineAppointmentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public void updateAppointmentStatus(Integer vaccineAppointmentId, String status) {
        logger.debug("Updating status for vaccineAppointmentId: {} to {}", vaccineAppointmentId, status);
        Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentRepository.findById(vaccineAppointmentId);
        if (!appointmentOpt.isPresent()) {
            throw new RuntimeException("Vaccine appointment not found");
        }
        VaccineAppointment appointment = appointmentOpt.get();
        appointment.setStatus(status);
        vaccineAppointmentRepository.save(appointment);
    }

    public Optional<VaccineAppointment> getAppointmentById(Integer vaccineAppointmentId) {
        logger.debug("Fetching appointment by id: {}", vaccineAppointmentId);
        return vaccineAppointmentRepository.findById(vaccineAppointmentId);
    }

    private String getAuthenticationInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.toString() : "No Authentication";
    }

    private Integer getCurrentParentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            logger.warn("SecurityContext lost or not authenticated, username is null");
            throw new SecurityException("Unauthorized: No authenticated user");
        }
        try {
            return Integer.parseInt(auth.getName());
        } catch (NumberFormatException e) {
            logger.error("Invalid username format: {}", auth.getName(), e);
            throw new SecurityException("Unauthorized: Invalid username format");
        }
    }

    public List<VaccineAppointmentHistoryDTO> getHistoryByUsername(String username) {
        Account account = accountRepository.findByUsername(username);
        if (account == null) return Collections.emptyList();
        List<VaccineAppointment> history = vaccineAppointmentRepository.findByAccountId(account.getId());
        return history.stream().map(va -> {
            VaccineAppointmentHistoryDTO dto = new VaccineAppointmentHistoryDTO();
            dto.setId(va.getId());
            if (va.getVaccine() != null) {
                dto.setVaccineName(va.getVaccine().getName());
                dto.setVaccineId(va.getVaccine().getId());
                dto.setVaccineImage(va.getVaccine().getImage());
            } else {
                dto.setVaccineName(null);
                dto.setVaccineId(null);
                dto.setVaccineImage(null);
            }
            dto.setAppointmentDate(va.getAppointmentDate() != null ? va.getAppointmentDate().toString() : null);
            dto.setLocation(va.getLocation());
            dto.setStatus(va.getStatus());
            return dto;
        }).collect(Collectors.toList());
    }
}
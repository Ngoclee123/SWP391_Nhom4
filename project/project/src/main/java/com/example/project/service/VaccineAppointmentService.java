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
import com.example.project.repository.ParentRepository;
import com.example.project.dto.VaccineAppointmentHistoryDTO;
import com.example.project.dto.VaccineAppointmentDTO;
import com.example.project.dto.VaccineStatisticsDTO;
import com.example.project.event.VaccineAppointmentCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
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
    private ParentRepository parentRepository;

    @Autowired
    @Qualifier("securityTaskExecutor")
    private TaskExecutor taskExecutor;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

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

    @Transactional
    public ResponseEntity<?> createAppointment(VaccineAppointmentRequest request, Authentication authentication) {
        try {
            logger.debug("Creating appointment with data: {}", request);
            if (request == null || request.getVaccineId() == null || request.getPatientId() == null ||
                    request.getAppointmentDate() == null || request.getLocation() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Dữ liệu không hợp lệ."));
            }
            Integer patientId = request.getPatientId();
            Integer vaccineId = request.getVaccineId();
            String appointmentDateStr = request.getAppointmentDate();
            logger.debug("Received appointmentDateStr: {}", appointmentDateStr);
            String location = request.getLocation();
            String notes = request.getNotes();
            Integer doseNumber = request.getDoseNumber();
            // Parse ISO string local time thành LocalDateTime và ép micro giây về 0
            LocalDateTime appointmentDate = LocalDateTime.parse(appointmentDateStr).withNano(0);
            logger.debug("Parsed appointmentDate (Local): {}", appointmentDate.toString());
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
            Vaccine vaccine = vaccineRepository.findById(vaccineId)
                    .orElseThrow(() -> new IllegalArgumentException("Vaccine not found"));
            // Lấy tất cả slot cùng vaccineId, location, so sánh availableDate đến giây (bỏ qua micro giây)
            List<VaccineAvailability> slots = vaccineAvailabilityRepository.findByVaccine_vaccin_id(vaccineId);
            // Log debug để kiểm tra giá trị thực tế
            System.out.println("Request: " + appointmentDate + " - " + location);
            for (VaccineAvailability va : slots) {
                System.out.println("Slot: " + va.getAvailableDate().withNano(0) + " - " + va.getLocation() + " - capacity: " + va.getCapacity());
            }
            // So sánh location không phân biệt hoa thường, bỏ dấu cách thừa
            VaccineAvailability availability = slots.stream()
                .filter(va -> va.getLocation().trim().equalsIgnoreCase(location.trim())
                    && va.getAvailableDate().withNano(0).equals(appointmentDate))
                .findFirst().orElse(null);
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
            appointment.setCreatedAt(LocalDateTime.now());
            Integer parentId = getCurrentParentId();
            Parent parent = parentRepository.findById(parentId).orElseThrow(() -> new IllegalArgumentException("Parent not found"));
            appointment.setParent(parent);
            VaccineAppointment savedAppointment = vaccineAppointmentRepository.save(appointment);

            // Publish event for notification after transaction completes
            logger.info("About to publish event for vaccine appointment ID: {}", savedAppointment.getId());
            eventPublisher.publishEvent(new VaccineAppointmentCreatedEvent(this, savedAppointment.getId()));
            logger.info("Published vaccine appointment created event for ID: {}", savedAppointment.getId());

            availability.setCapacity(availability.getCapacity() - 1);
            vaccineAvailabilityRepository.save(availability);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đặt lịch thành công!");
            response.put("vaccineAppointmentId", savedAppointment.getId());
            response.put("id", savedAppointment.getId()); // Thêm key id để đảm bảo
            
            Map<String, Object> data = new HashMap<>();
            data.put("vaccineName", vaccine.getName());
            data.put("price", vaccine.getPrice());
            data.put("location", location);
            data.put("appointmentDate", appointmentDate.toString());
            data.put("appointmentId", savedAppointment.getId()); // Thêm appointmentId vào data
            
            response.put("data", data);
            
            logger.info("Created appointment with ID: {}, response: {}", savedAppointment.getId(), response);
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
        payment.setParent(appointment.getParent());
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

                appointment.setAppointmentDate(LocalDateTime.parse(request.getAppointmentDate()));
                appointment.setDoseNumber(request.getDoseNumber() != null ? request.getDoseNumber() : 1);
                appointment.setLocation(request.getLocation());
                appointment.setNotes(request.getNotes());
                appointment.setStatus("Pending");
                appointment.setCreatedAt(LocalDateTime.now());
                Parent parent = parentRepository.findById(parentId).orElseThrow(() -> new IllegalArgumentException("Parent not found"));
                appointment.setParent(parent);
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
        String username = auth.getName();
        Account account = accountRepository.findByUsername(username);
        if (account == null) {
            logger.error("No account found for username: {}", username);
            throw new SecurityException("Unauthorized: No account found");
        }
        Parent parent = parentRepository.findByAccountId(account.getId());
        if (parent == null) {
            logger.error("No parent found for accountId: {}", account.getId());
            throw new SecurityException("Unauthorized: No parent found");
        }
        return parent.getId();
    }

    public Page<VaccineAppointmentHistoryDTO> getHistoryByUsername(String username, Pageable pageable) {
        Account account = accountRepository.findByUsername(username);
        if (account == null) return Page.empty();
        Page<VaccineAppointment> historyPage = vaccineAppointmentRepository.findByAccountId(account.getId(), pageable);
        return historyPage.map(va -> {
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
        });
    }

    public Page<VaccineAppointmentDTO> getAllAppointments(Pageable pageable) {
        return vaccineAppointmentRepository.findAll(pageable).map(va -> {
            VaccineAppointmentDTO dto = new VaccineAppointmentDTO();
            dto.setId(va.getId());
            if (va.getPatient() != null) {
                dto.setPatientName(va.getPatient().getFullName());
                dto.setPatientId(va.getPatient().getId());
            } else {
                dto.setPatientName(null);
                dto.setPatientId(null);
            }
            if (va.getVaccine() != null) {
                dto.setVaccineName(va.getVaccine().getName());
                dto.setVaccineId(va.getVaccine().getId());
            } else {
                dto.setVaccineName(null);
                dto.setVaccineId(null);
            }
            // Chuyển appointmentDate từ UTC sang local time (Asia/Ho_Chi_Minh)
            if (va.getAppointmentDate() != null) {
                dto.setAppointmentDate(va.getAppointmentDate());
            } else {
                dto.setAppointmentDate(null);
            }
            dto.setLocation(va.getLocation());
            dto.setStatus(va.getStatus());
            return dto;
        });
    }

    @Transactional
    public boolean updateAppointmentStatusOnlyStatus(Integer id, String status) {
        return vaccineAppointmentRepository.updateStatus(id, status) > 0;
    }
    @Transactional
    public boolean deleteAppointment(Integer id) {
        paymentRepository.deleteByVaccineAppointmentId(id);
        if (vaccineAppointmentRepository.existsById(id)) {
            vaccineAppointmentRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public VaccineAppointment updateAppointmentStatus(Integer id, String status) {
        Optional<VaccineAppointment> opt = vaccineAppointmentRepository.findById(id);
        if (opt.isPresent()) {
            VaccineAppointment app = opt.get();
            app.setStatus(status);
            return vaccineAppointmentRepository.save(app);
        }
        return null;
    }

    public VaccineStatisticsDTO getVaccineStatistics(int month, int year) {
        VaccineStatisticsDTO dto = new VaccineStatisticsDTO();
        
        // Tính doanh thu dựa trên tất cả vaccine appointments trong tháng (Pending, Confirmed, Completed)
        Double totalRevenue = vaccineAppointmentRepository.getTotalRevenueByAllAppointments(month, year);
        
        // Nếu không có doanh thu từ appointments, thử tính từ completed appointments
        if (totalRevenue == null || totalRevenue == 0) {
            totalRevenue = vaccineAppointmentRepository.getTotalRevenueByCompletedAppointments(month, year);
        }
        
        // Nếu vẫn không có, thử tính từ payments
        if (totalRevenue == null || totalRevenue == 0) {
            totalRevenue = vaccineAppointmentRepository.getTotalRevenueByMonth(month, year);
        }
        
        dto.setTotalRevenue(totalRevenue != null ? totalRevenue : 0);
        
        Map<String, Integer> typeCount = new java.util.HashMap<>();
        for (Object[] row : vaccineAppointmentRepository.getVaccineTypeCountByMonth(month, year)) {
            typeCount.put((String) row[0], ((Number) row[1]).intValue());
        }
        dto.setVaccineTypeCount(typeCount);
        dto.setVaccineCategoryCount(new java.util.HashMap<>()); // Nếu có danh mục, bổ sung sau
        
        // Log để debug
        logger.info("Vaccine statistics for {}/{}: totalRevenue={}, typeCount={}", month, year, totalRevenue, typeCount);
        
        return dto;
    }
    
    public Map<String, Object> getVaccineStatisticsDebug(int month, int year) {
        Map<String, Object> debugInfo = new java.util.HashMap<>();
        
        // Lấy doanh thu từ payments
        Double revenueFromPayments = vaccineAppointmentRepository.getTotalRevenueByMonth(month, year);
        debugInfo.put("revenueFromPayments", revenueFromPayments);
        
        // Lấy doanh thu từ completed appointments
        Double revenueFromCompletedAppointments = vaccineAppointmentRepository.getTotalRevenueByCompletedAppointments(month, year);
        debugInfo.put("revenueFromCompletedAppointments", revenueFromCompletedAppointments);
        
        // Lấy doanh thu từ tất cả appointments (Pending, Confirmed, Completed)
        Double revenueFromAllAppointments = vaccineAppointmentRepository.getTotalRevenueByAllAppointments(month, year);
        debugInfo.put("revenueFromAllAppointments", revenueFromAllAppointments);
        
        // Lấy tất cả appointments trong tháng để debug
        List<Object[]> appointments = vaccineAppointmentRepository.getVaccineAppointmentsForDebug(month, year);
        List<Map<String, Object>> appointmentDetails = new java.util.ArrayList<>();
        
        for (Object[] row : appointments) {
            Map<String, Object> detail = new java.util.HashMap<>();
            detail.put("id", row[0]);
            detail.put("status", row[1]);
            detail.put("appointmentDate", row[2]);
            detail.put("vaccineName", row[3]);
            detail.put("vaccinePrice", row[4]);
            appointmentDetails.add(detail);
        }
        
        debugInfo.put("appointments", appointmentDetails);
        debugInfo.put("totalAppointments", appointments.size());
        
        // Lấy số lượng theo loại vaccine
        Map<String, Integer> typeCount = new java.util.HashMap<>();
        for (Object[] row : vaccineAppointmentRepository.getVaccineTypeCountByMonth(month, year)) {
            typeCount.put((String) row[0], ((Number) row[1]).intValue());
        }
        debugInfo.put("typeCount", typeCount);
        
        logger.info("Debug info for {}/{}: {}", month, year, debugInfo);
        
        return debugInfo;
    }

    // API cho user gửi yêu cầu hủy lịch vaccine
    public ResponseEntity<?> requestCancelAppointment(Integer appointmentId) {
        Optional<VaccineAppointment> opt = vaccineAppointmentRepository.findById(appointmentId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        VaccineAppointment app = opt.get();
        // Chỉ cho phép hủy khi đang Pending hoặc Confirmed
        if (!app.getStatus().equalsIgnoreCase("Pending") && !app.getStatus().equalsIgnoreCase("Confirmed")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể yêu cầu hủy ở trạng thái hiện tại."));
        }
        app.setStatus("CancelRequested");
        vaccineAppointmentRepository.save(app);
        return ResponseEntity.ok(Map.of("message", "Đã gửi yêu cầu hủy lịch thành công."));
    }

    // API cho admin duyệt trạng thái
    public ResponseEntity<?> adminUpdateStatus(Integer appointmentId, String newStatus) {
        Optional<VaccineAppointment> opt = vaccineAppointmentRepository.findById(appointmentId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        VaccineAppointment app = opt.get();
        String current = app.getStatus();
        // Chỉ cho phép chuyển hợp lệ
        if (current.equalsIgnoreCase("Pending") && (newStatus.equalsIgnoreCase("Confirmed") || newStatus.equalsIgnoreCase("Cancelled"))) {
            app.setStatus(newStatus);
        } else if (current.equalsIgnoreCase("Confirmed") && newStatus.equalsIgnoreCase("Completed")) {
            app.setStatus("Completed");
        } else if (current.equalsIgnoreCase("CancelRequested") && newStatus.equalsIgnoreCase("Cancelled")) {
            app.setStatus("Cancelled");
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Chuyển trạng thái không hợp lệ."));
        }
        vaccineAppointmentRepository.save(app);
        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công."));
    }
}
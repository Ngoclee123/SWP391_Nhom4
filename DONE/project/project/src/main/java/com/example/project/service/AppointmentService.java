package com.example.project.service;

import com.example.project.dto.AppointmentDTO;
import com.example.project.dto.AppointmentRequestDTO;
import com.example.project.model.Appointment;
import com.example.project.model.Doctor;
import com.example.project.model.Patient;
import com.example.project.model.Specialty;
import com.example.project.repository.AppointmentRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.PatientRepository;
import com.example.project.repository.SpecialtyRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private SpecialtyRepository specialtyRepository;
    // Inject ServiceRepository nếu bạn có
    // @Autowired
    // private ServiceRepository serviceRepository;

    @Transactional
    public Appointment createAppointment(AppointmentRequestDTO requestDTO) {
        // 1. Lấy các đối tượng đầy đủ từ database bằng ID
        Patient patient = patientRepository.findById(requestDTO.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with ID: " + requestDTO.getPatientId()));

        Doctor doctor = doctorRepository.findById(requestDTO.getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with ID: " + requestDTO.getDoctorId()));
        Specialty specialty = null;
        if (requestDTO.getSpecialtyId() != null) {
            specialty = specialtyRepository.findById(requestDTO.getSpecialtyId())
                    .orElseThrow(() -> new EntityNotFoundException("Specialty not found with ID: " + requestDTO.getSpecialtyId()));
        }
        // Bỏ xử lý service nếu serviceId null hoặc repository chưa được inject

        // 2. Tạo đối tượng Appointment mới
        Appointment appointment = new Appointment();

        // 3. Gán các ĐỐI TƯỢNG (không phải ID) vào appointment
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSpecialty(specialty);

        // 4. Gán các thông tin còn lại từ DTO và giá trị mặc định
        appointment.setAppointmentDate(requestDTO.getAppointmentDate());
        appointment.setDuration(requestDTO.getDuration() != null ? requestDTO.getDuration() : 60); // Mặc định 60 phút
        String notes = (requestDTO.getNotes()!=null && !requestDTO.getNotes().isBlank())
                ? requestDTO.getNotes()
                : null;
        appointment.setNotes(notes);
        appointment.setStatus(requestDTO.getStatus() != null ? requestDTO.getStatus() : "Pending");
        appointment.setPriority(requestDTO.getPriority() != null ? requestDTO.getPriority() : "Normal");
        appointment.setConsultationType(requestDTO.getConsultationType() != null ? requestDTO.getConsultationType() : "InPerson");

        // Thêm paymentMethod (NOT NULL) và optional bankCode
        appointment.setPaymentMethod(requestDTO.getPaymentMethod() != null ? requestDTO.getPaymentMethod() : "later");
        appointment.setTotalFee(null); // hoặc tính phí nếu có logic

        // Lưu thêm appointmentTime (OffsetDateTime) dựa trên appointmentDate
        if (requestDTO.getAppointmentDate() != null) {
            // appointmentTime = slot start time with system default offset
            appointment.setAppointmentTime(requestDTO.getAppointmentDate().atOffset(ZoneOffset.ofHours(7)));
        }

        // Thời gian tạo bản ghi
        appointment.setCreatedAt(LocalDateTime.now());

        // ❶ Lấy dữ liệu từ DTO
        appointment.setSymptoms(requestDTO.getSymptoms());   // <─ thêm

        // 5. Lưu vào database và trả về
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByPatient(Integer patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with ID: " + patientId));
        return appointmentRepository.findByPatient(patient);
    }

    private boolean isValidStatus(String status) {
        return status != null && (
                status.equalsIgnoreCase("Pending") ||
                        status.equalsIgnoreCase("Confirmed") ||
                        status.equalsIgnoreCase("Completed") ||
                        status.equalsIgnoreCase("Cancelled")
        );
    }

    // Helper để chuẩn hóa status về đúng định dạng
    private String normalizeStatus(String status) {
        if (status == null) return null;
        switch (status.toLowerCase()) {
            case "pending": return "Pending";
            case "confirmed": return "Confirmed";
            case "completed": return "Completed";
            case "cancelled": return "Cancelled";
            default: return status;
        }
    }

    public void updateAppointmentStatus(int appointmentId, String status) {
        String normalizedStatus = normalizeStatus(status);
        if (!isValidStatus(normalizedStatus)) {
            throw new RuntimeException("Trạng thái không hợp lệ!");
        }
        if (!appointmentRepository.existsById(appointmentId)) {
            throw new RuntimeException("Không tìm thấy lịch hẹn!");
        }
        appointmentRepository.updateStatusById(appointmentId, normalizedStatus);
    }

    public Appointment getAppointmentById(int appointmentId) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with ID: " + appointmentId));
        // Đảm bảo status luôn đúng định dạng
        a.setStatus(normalizeStatus(a.getStatus()));
        return a;
    }






    // Lấy tất cả lịch hẹn của bác sĩ
    public List<Appointment> getAppointmentsByDoctorId(Integer doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    // Lấy lịch hẹn sắp tới (chưa hoàn thành, thời gian sau hiện tại)
    public List<Appointment> getUpcomingAppointments(Integer doctorId) {
        LocalDateTime now = LocalDateTime.now();
        return appointmentRepository.findByDoctorIdAndAppointmentTimeAfter(doctorId, now);
    }

    // Lấy lịch hẹn đã hoàn thành
    public List<Appointment> getCompletedAppointments(Integer doctorId) {
        return appointmentRepository.findByDoctorIdAndStatusOrderByAppointmentTimeDesc(doctorId, "Completed");
    }

    // Lấy lịch hẹn theo trạng thái bất kỳ
    public List<Appointment> getAppointmentsByStatus(Integer doctorId, String status) {
        return appointmentRepository.findByDoctorIdAndStatus(doctorId, status);

    }

    // Lấy tất cả appointments
    public List<AppointmentDTO> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream()
                .map(a -> toDTO(a))
                .collect(Collectors.toList());
    }

    // Lấy appointments theo patient ID
    public List<AppointmentDTO> getAppointmentsByPatientId(int patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        return appointments.stream()
                .map(a -> toDTO(a))
                .collect(Collectors.toList());
    }

    // Lấy appointments theo doctor ID
    public List<AppointmentDTO> getAppointmentsByDoctorId(int doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
        return appointments.stream()
                .map(a -> toDTO(a))
                .collect(Collectors.toList());
    }

    // Lấy appointments theo status
    public List<AppointmentDTO> getAppointmentsByStatus(String status) {
        List<Appointment> appointments = appointmentRepository.findByStatus(status);
        return appointments.stream()
                .map(a -> toDTO(a))
                .collect(Collectors.toList());
    }

    // Lấy appointments theo ngày
    public List<AppointmentDTO> getAppointmentsByDate(LocalDate date) {
        List<Appointment> appointments = appointmentRepository.findByAppointmentDate(date);
        return appointments.stream()
                .map(a -> toDTO(a))
                .collect(Collectors.toList());
    }

    // Cập nhật appointment
    public AppointmentDTO updateAppointment(int appointmentId, AppointmentDTO appointmentDTO) {
        Optional<Appointment> optional = appointmentRepository.findById(appointmentId);
        if (!optional.isPresent()) {
            return null;
        }

        Appointment appointment = optional.get();

        // Cập nhật các trường
        if (appointmentDTO.getAppointmentDate() != null) {
            appointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        }
        if (appointmentDTO.getAppointmentTime() != null) {
            String timeStr = appointmentDTO.getAppointmentTime(); // giả sử trả về chuỗi thời gian
            OffsetDateTime appointmentTime = OffsetDateTime.parse(timeStr); // hoặc dùng formatter nếu cần
            appointment.setAppointmentTime(appointmentTime);
        }
        if (appointmentDTO.getDuration() != null) {
            appointment.setDuration(appointmentDTO.getDuration());
        }
        if (appointmentDTO.getPriority() != null) {
            appointment.setPriority(appointmentDTO.getPriority());
        }
        if (appointmentDTO.getConsultationType() != null) {
            appointment.setConsultationType(appointmentDTO.getConsultationType());
        }
        if (appointmentDTO.getStatus() != null) {
            appointment.setStatus(appointmentDTO.getStatus());
        }
        if (appointmentDTO.getNotes() != null) {
            appointment.setNotes(appointmentDTO.getNotes());
        }
        if (appointmentDTO.getPaymentMethod() != null) {
            appointment.setPaymentMethod(appointmentDTO.getPaymentMethod());
        }
        if (appointmentDTO.getTotalFee() != null) {
            appointment.setTotalFee(appointmentDTO.getTotalFee());
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return toDTO(savedAppointment);
    }

    // Xóa appointment
    public boolean deleteAppointment(int appointmentId) {
        Optional<Appointment> optional = appointmentRepository.findById(appointmentId);
        if (!optional.isPresent()) {
            return false;
        }

        appointmentRepository.deleteById(appointmentId);
        return true;
    }

    // Thống kê appointments
    public static class AppointmentStatsDTO {
        // Trường cũ
        public long total;
        public long pending;
        public long confirmed;
        public long completed;
        public long cancelled;
        public java.util.Map<String, Long> statusCounts;
        public java.util.List<Object[]> byDate;
        public java.util.List<java.util.Map<String, Object>> byDoctor;
        // Trường mới cho FE
        public long totalAppointments;
        public long todayAppointments;
        public long thisMonthAppointments;
        public long thisYearAppointments;
        public java.util.List<java.util.Map<String, Object>> monthlyStats;
        public java.util.List<java.util.Map<String, Object>> dailyStats;
    }

    public AppointmentStatsDTO getAppointmentStats() {
        AppointmentStatsDTO stats = new AppointmentStatsDTO();
        // Populate trường cũ
        stats.total = appointmentRepository.count();
        stats.pending = appointmentRepository.countByStatus("Pending");
        stats.confirmed = appointmentRepository.countByStatus("Confirmed");
        stats.completed = appointmentRepository.countByStatus("Completed");
        stats.cancelled = appointmentRepository.countByStatus("Cancelled");
        stats.statusCounts = new java.util.HashMap<>();
        stats.statusCounts.put("Pending", stats.pending);
        stats.statusCounts.put("Confirmed", stats.confirmed);
        stats.statusCounts.put("Completed", stats.completed);
        stats.statusCounts.put("Cancelled", stats.cancelled);
        stats.byDate = appointmentRepository.countGroupByDate();
        stats.byDoctor = new java.util.ArrayList<>();
        for (Object[] arr : appointmentRepository.countGroupByDoctor()) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("doctorId", arr[0]);
            map.put("doctorName", arr[1]);
            map.put("count", arr[2]);
            stats.byDoctor.add(map);
        }

        // Populate trường mới cho FE
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.YearMonth thisMonth = java.time.YearMonth.now();
        int thisYear = today.getYear();
        stats.totalAppointments = stats.total;
        stats.todayAppointments = appointmentRepository.countByAppointmentDateBetween(today.atStartOfDay(), today.atTime(23, 59, 59));
        stats.thisMonthAppointments = appointmentRepository.countByAppointmentDateBetween(
                thisMonth.atDay(1).atStartOfDay(), thisMonth.atEndOfMonth().atTime(23, 59, 59)
        );
        stats.thisYearAppointments = appointmentRepository.countByAppointmentDateBetween(
                java.time.LocalDate.of(thisYear, 1, 1).atStartOfDay(), java.time.LocalDate.of(thisYear, 12, 31).atTime(23, 59, 59)
        );
        // Thống kê theo ngày
        stats.dailyStats = new java.util.ArrayList<>();
        for (Object[] arr : appointmentRepository.countGroupByDate()) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("date", arr[0]);
            map.put("count", arr[1]);
            stats.dailyStats.add(map);
        }
        // Thống kê theo tháng
        stats.monthlyStats = new java.util.ArrayList<>();
        for (Object[] arr : appointmentRepository.countGroupByMonth()) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("month", arr[0]);
            map.put("count", arr[1]);
            stats.monthlyStats.add(map);
        }
        return stats;
    }

    public List<AppointmentDTO> getRecentAppointments(int limit) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit);
        List<Appointment> appointments = appointmentRepository.findRecentAppointments(pageable);
        return appointments.stream().map(this::toDTO).collect(java.util.stream.Collectors.toList());
    }

    public AppointmentDTO toDTO(Appointment a) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(a.getAppointmentId());
        dto.setPatientId(a.getPatient() != null ? a.getPatient().getId() : null);
        dto.setDoctorId(a.getDoctor() != null ? a.getDoctor().getId() : null);
        dto.setSpecialtyId(a.getSpecialty() != null ? a.getSpecialty().getId() : null);
        dto.setServiceId(a.getServiceId()); // Nếu getServiceId() có thể null thì giữ nguyên
        dto.setAppointmentDate(a.getAppointmentDate());
        dto.setDuration(a.getDuration());
        dto.setPriority(a.getPriority());
        dto.setConsultationType(a.getConsultationType());
        dto.setStatus(normalizeStatus(a.getStatus()));
        dto.setNotes(a.getNotes());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setAppointmentTime(a.getAppointmentTime() != null ? a.getAppointmentTime().toString() : null);
        dto.setPaymentMethod(a.getPaymentMethod());
        dto.setTotalFee(a.getTotalFee());
        // Bổ sung tên bệnh nhân và tên bác sĩ
        try {
            if (a.getPatient() != null && a.getPatient().getId() != null) {
                patientRepository.findById(a.getPatient().getId()).ifPresent(p -> dto.setPatientName(p.getFullName()));
            }
            if (a.getDoctor() != null && a.getDoctor().getId() != null) {
                doctorRepository.findById(a.getDoctor().getId()).ifPresent(d -> dto.setDoctorName(d.getFullName()));
            }
        } catch (Exception ignore) {}
        return dto;
    }




}

package com.example.project.service;

import com.example.project.dto.AppointmentDTO;
import com.example.project.dto.AppointmentRequestDTO;
import com.example.project.model.Appointment;
import com.example.project.repository.AppointmentRepository;
    import com.example.project.repository.PatientRepository;
import com.example.project.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    public Appointment createAppointment(int patientId, AppointmentRequestDTO requestDTO) {
        Appointment appointment = new Appointment();
        appointment.setPatientId(patientId);
        appointment.setDoctorId(requestDTO.getDoctorId());
        // Parse time string (e.g. "08:00:00") to LocalTime
        appointment.setAppointmentTime(requestDTO.getAppointmentTime());
        appointment.setTotalFee(java.math.BigDecimal.valueOf(requestDTO.getTotalFee()));
        appointment.setPaymentMethod(requestDTO.getPaymentMethod());
        appointment.setStatus("Pending");
        return appointmentRepository.save(appointment);
    }

    public void updateAppointmentStatus(int appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);
        if (appointment != null) {
            appointment.setStatus(status);
            appointmentRepository.save(appointment);
        }
    }

    public Appointment getAppointmentById(int appointmentId) {
        return appointmentRepository.findById(appointmentId).orElse(null);
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
            appointment.setAppointmentTime(appointmentDTO.getAppointmentTime());
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
        public java.util.List<Object[]> byDoctor;

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
        stats.byDoctor = appointmentRepository.countGroupByDoctor();

        // Populate trường mới cho FE
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.YearMonth thisMonth = java.time.YearMonth.now();
        int thisYear = today.getYear();
        stats.totalAppointments = stats.total;
        stats.todayAppointments = appointmentRepository.countByAppointmentDate(today);
        stats.thisMonthAppointments = appointmentRepository.countByAppointmentDateBetween(
            thisMonth.atDay(1), thisMonth.atEndOfMonth()
        );
        stats.thisYearAppointments = appointmentRepository.countByAppointmentDateBetween(
            java.time.LocalDate.of(thisYear, 1, 1), java.time.LocalDate.of(thisYear, 12, 31)
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
        dto.setAppointmentId(a.getAppointmentId());
        dto.setPatientId(a.getPatientId());
        dto.setDoctorId(a.getDoctorId());
        dto.setSpecialtyId(a.getSpecialtyId());
        dto.setServiceId(a.getServiceId());
        dto.setAppointmentDate(a.getAppointmentDate());
        dto.setDuration(a.getDuration());
        dto.setPriority(a.getPriority());
        dto.setConsultationType(a.getConsultationType());
        dto.setStatus(a.getStatus());
        dto.setNotes(a.getNotes());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setAppointmentTime(a.getAppointmentTime());
        dto.setPaymentMethod(a.getPaymentMethod());
        dto.setTotalFee(a.getTotalFee());
        // Bổ sung tên bệnh nhân và tên bác sĩ
        try {
            if (a.getPatientId() != null) {
                patientRepository.findById(a.getPatientId()).ifPresent(p -> dto.setPatientName(p.getFullName()));
            }
            if (a.getDoctorId() != null) {
                doctorRepository.findById(a.getDoctorId()).ifPresent(d -> dto.setDoctorName(d.getFullName()));
            }
        } catch (Exception ignore) {}
        return dto;
    }
}

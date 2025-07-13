package com.example.project.service;

import com.example.project.dto.AppointmentDTO;
import com.example.project.dto.AppointmentRequestDTO;
import com.example.project.model.Appointment;
import com.example.project.repository.AppointmentRepository;
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
        public long total;
        public long pending;
        public long confirmed;
        public long completed;
        public long cancelled;
        public java.util.Map<String, Long> statusCounts;
        public java.util.List<Object[]> byDate;
        public java.util.List<Object[]> byDoctor;
    }

    public AppointmentStatsDTO getAppointmentStats() {
        AppointmentStatsDTO stats = new AppointmentStatsDTO();
        stats.total = appointmentRepository.count();
        
        // Đếm theo trạng thái
        stats.pending = appointmentRepository.countByStatus("Pending");
        stats.confirmed = appointmentRepository.countByStatus("Confirmed");
        stats.completed = appointmentRepository.countByStatus("Completed");
        stats.cancelled = appointmentRepository.countByStatus("Cancelled");
        
        // Map trạng thái
        stats.statusCounts = new java.util.HashMap<>();
        stats.statusCounts.put("Pending", stats.pending);
        stats.statusCounts.put("Confirmed", stats.confirmed);
        stats.statusCounts.put("Completed", stats.completed);
        stats.statusCounts.put("Cancelled", stats.cancelled);
        
        // Thống kê theo ngày và bác sĩ
        stats.byDate = appointmentRepository.countGroupByDate();
        stats.byDoctor = appointmentRepository.countGroupByDoctor();
        
        return stats;
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
        return dto;
    }
}

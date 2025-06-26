package com.example.project.service;

import com.example.project.model.Appointment;
import com.example.project.model.DoctorAvailability;
import com.example.project.repository.AppointmentRepository;
import com.example.project.repository.DoctorAvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

import java.time.LocalDateTime;
import com.example.project.dto.AppointmentDTO;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;

    // Lấy tất cả lịch hẹn của một bác sĩ
    public List<Appointment> getAppointmentsByDoctorId(int doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    // Lấy lịch hẹn theo id
    public Appointment getAppointmentById(int appointmentId) {
        return appointmentRepository.findById(appointmentId).orElse(null);
    }

    // Tạo lịch hẹn mới (bạn cần truyền đủ các trường)
    public Appointment createAppointment(Appointment appointment) {
        appointment.setStatus("Pending");
        appointment.setCreatedAt(LocalDateTime.now());
        return appointmentRepository.save(appointment);
    }

    // Cập nhật trạng thái
    public void updateAppointmentStatus(int appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);
        if (appointment != null) {
            appointment.setStatus(status);
            appointmentRepository.save(appointment);
        }
    }

    // Lấy tất cả lịch hẹn của một bác sĩ (trả về DTO)
    public List<AppointmentDTO> getAppointmentDTOsByDoctorId(int doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
        return appointments.stream().map(appt -> new AppointmentDTO(
                appt.getId(),
                appt.getPatientId(),
                appt.getDoctorId(),
                appt.getSpecialtyId(),
                appt.getServiceId(),
                appt.getAppointmentDate(),
                appt.getDuration(),
                appt.getPriority(),
                appt.getConsultationType(),
                appt.getStatus(),
                appt.getNotes(),
                appt.getCreatedAt()
        )).toList();
    }

    @Service
    public static class DoctorAvailabilityService {
        @Autowired
        private DoctorAvailabilityRepository doctorAvailabilityRepository;

        public List<DoctorAvailability> getByDoctorId(Integer doctorId) {
            return doctorAvailabilityRepository.findByDoctorId(doctorId);
        }
    }
}
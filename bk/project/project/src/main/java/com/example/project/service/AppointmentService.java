package com.example.project.service;

import com.example.project.dto.AppointmentRequestDTO;
import com.example.project.model.Appointment;
import com.example.project.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// import java.time.LocalDateTime;
// import java.time.format.DateTimeFormatter;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public Appointment createAppointment(int patientId, AppointmentRequestDTO requestDTO) {
        Appointment appointment = new Appointment();
        appointment.setPatientId(patientId);
        appointment.setDoctorId(requestDTO.getDoctorId());
        // Parse time string (e.g. "08:00:00") to LocalTime
        appointment.setAppointmentTime(java.time.LocalTime.parse(requestDTO.getAppointmentTime(), java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss")));
        appointment.setTotalFee(requestDTO.getTotalFee());
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
    // Thêm phương thức getAppointmentById
    public Appointment getAppointmentById(int appointmentId) {
        return appointmentRepository.findById(appointmentId).orElse(null);
    }
}

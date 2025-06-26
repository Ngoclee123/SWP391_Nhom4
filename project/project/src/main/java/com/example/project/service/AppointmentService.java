package com.example.project.service;

import com.example.project.dto.AppointmentRequestDTO;
import com.example.project.model.*;
import com.example.project.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

        Specialty specialty = specialtyRepository.findById(requestDTO.getSpecialtyId())
                .orElseThrow(() -> new EntityNotFoundException("Specialty not found with ID: " + requestDTO.getSpecialtyId()));

        // 2. Tạo đối tượng Appointment mới
        Appointment appointment = new Appointment();

        // 3. Gán các ĐỐI TƯỢNG (không phải ID) vào appointment
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSpecialty(specialty);

        // 4. Gán các thông tin còn lại từ DTO và giá trị mặc định
        appointment.setAppointmentDate(requestDTO.getAppointmentDate());
        appointment.setDuration(requestDTO.getDuration() != null ? requestDTO.getDuration() : 60); // Mặc định 60 phút
        appointment.setNotes(requestDTO.getNotes());
        appointment.setStatus(requestDTO.getStatus() != null ? requestDTO.getStatus() : "Pending");
        appointment.setPriority(requestDTO.getPriority() != null ? requestDTO.getPriority() : "Normal");
        appointment.setConsultationType(requestDTO.getConsultationType() != null ? requestDTO.getConsultationType() : "InPerson");

        // Logic cho service (nếu có)
        // if (requestDTO.getServiceId() != null) {
        //     Service service = serviceRepository.findById(requestDTO.getServiceId()).orElse(null);
        //     appointment.setService(service);
        // }
        
        // 5. Lưu vào database và trả về
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByPatient(Integer patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with ID: " + patientId));
        return appointmentRepository.findByPatient(patient);
    }

    public void updateAppointmentStatus(int appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with ID: " + appointmentId));
        appointment.setStatus(status);
        appointmentRepository.save(appointment);
    }

    public Appointment getAppointmentById(int appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with ID: " + appointmentId));
    }
}

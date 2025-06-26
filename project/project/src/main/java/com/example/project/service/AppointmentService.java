package com.example.project.service;

import com.example.project.dto.AppointmentRequestDTO;
import com.example.project.model.*;
import com.example.project.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.time.ZoneOffset;
import java.time.LocalDateTime;

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
                : (requestDTO.getSymptoms()!=null ? requestDTO.getSymptoms() : null);
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

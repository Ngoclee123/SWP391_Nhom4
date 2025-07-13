package com.example.project.controler.cart;

import com.example.project.dto.AppointmentRequestDTO;
import com.example.project.dto.AppointmentDTO;
import com.example.project.model.Appointment;
import com.example.project.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.example.project.model.Doctor;
import com.example.project.service.DoctorService;
import com.example.project.repository.AccountRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.project.model.Account;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;
    @Autowired
    private DoctorService doctorService;
    @Autowired
    private AccountRepository accountRepository;
    //
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentRequestDTO requestDTO) {
        try {
            Appointment appointment = appointmentService.createAppointment(requestDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("appointmentId", appointment.getAppointmentId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentDTO>> getPatientAppointments(@PathVariable Integer patientId) {
        List<Appointment> appointments = appointmentService.getAppointmentsByPatient(patientId);
        List<AppointmentDTO> dtos = appointments.stream()
            .map(a -> new AppointmentDTO(
                a.getAppointmentId(),
                a.getPatient() != null ? a.getPatient().getId() : null,
                a.getDoctor() != null ? a.getDoctor().getId() : null,
                a.getSpecialty() != null ? a.getSpecialty().getId() : null,
                null, // serviceId nếu có
                a.getAppointmentDate(),
                a.getDuration(),
                a.getPriority(),
                a.getConsultationType(),
                a.getStatus(),
                a.getNotes(),
                a.getCreatedAt()
            ))
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{appointmentId}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Integer appointmentId) {
        try {
            appointmentService.updateAppointmentStatus(appointmentId, "Cancelled");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable int id, @RequestParam String status) {
        try {
            appointmentService.updateAppointmentStatus(id, status);
            return ResponseEntity.ok("Cập nhật trạng thái thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lấy tất cả lịch hẹn của bác sĩ
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getAppointmentsByDoctor(@PathVariable Integer doctorId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String username = authentication.getName();
        Doctor doctor = doctorService.getDoctorEntityById(doctorId);
        if (doctor == null) {
            return ResponseEntity.status(404).body("Doctor not found");
        }
        Integer accountIdInToken = doctorService.getAccountIdByUsername(username);
        if (accountIdInToken == null || !doctor.getAccountId().equals(accountIdInToken)) {
            return ResponseEntity.status(403).body("Forbidden: You can only view your own appointments");
        }
        List<Appointment> appointments = appointmentService.getAppointmentsByDoctorId(doctorId);
        List<AppointmentDTO> dtos = appointments.stream()
            .map(a -> new AppointmentDTO(
                a.getAppointmentId(),
                a.getPatient() != null ? a.getPatient().getId() : null,
                a.getDoctor() != null ? a.getDoctor().getId() : null,
                a.getSpecialty() != null ? a.getSpecialty().getId() : null,
                null, // serviceId nếu có
                a.getAppointmentDate(),
                a.getDuration(),
                a.getPriority(),
                a.getConsultationType(),
                a.getStatus(),
                a.getNotes(),
                a.getCreatedAt()
            ))
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Lấy lịch hẹn sắp tới của bác sĩ
    @GetMapping("/doctor/{doctorId}/upcoming")
    public List<Appointment> getUpcomingAppointments(@PathVariable Integer doctorId) {
        return appointmentService.getUpcomingAppointments(doctorId);
    }

    // Lấy lịch hẹn đã hoàn thành của bác sĩ
    @GetMapping("/doctor/{doctorId}/completed")
    public List<Appointment> getCompletedAppointments(@PathVariable Integer doctorId) {
        return appointmentService.getCompletedAppointments(doctorId);
    }

    // Lấy lịch hẹn theo trạng thái bất kỳ
    @GetMapping("/doctor/{doctorId}/status/{status}")
    public List<Appointment> getAppointmentsByStatus(@PathVariable Integer doctorId, @PathVariable String status) {
        return appointmentService.getAppointmentsByStatus(doctorId, status);
    }
}
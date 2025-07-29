package com.example.project.controler.admin;

import com.example.project.dto.AppointmentDTO;
import com.example.project.model.Appointment;
import com.example.project.repository.AppointmentRepository;
import com.example.project.service.AppointmentService;
import com.example.project.service.DoctorService;
import com.example.project.service.admin.AdminAppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/appointments")
public class AdminAppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private AdminAppointmentService adminAppointmentService;

    @Autowired
    private DoctorService doctorService;

    // Lấy tất cả appointments
    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    // Lấy appointment theo ID
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable int id) {
        Appointment appointment = appointmentService.getAppointmentById(id);
        if (appointment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(appointmentService.toDTO(appointment));
    }

    // Lấy appointments theo patient ID
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByPatientId(@PathVariable int patientId) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(appointments);
    }

    // Lấy appointments theo doctor ID
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDoctorId(@PathVariable int doctorId) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDoctorId(doctorId);
        return ResponseEntity.ok(appointments);
    }

    // Lấy appointments theo status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByStatus(@PathVariable String status) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByStatus(status);
        return ResponseEntity.ok(appointments);
    }

    // Lấy appointments theo ngày
    @GetMapping("/date/{date}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDate(@PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDate(localDate);
        return ResponseEntity.ok(appointments);
    }

    // Lấy 4 lịch hẹn gần nhất
    @GetMapping("/recent")
    public ResponseEntity<List<AppointmentDTO>> getRecentAppointments() {
        List<AppointmentDTO> recent = appointmentService.getRecentAppointments(4);
        return ResponseEntity.ok(recent);
    }

    // API lấy slot hợp lệ của bác sĩ theo ngày (chỉ cho admin)
    @GetMapping("/doctor/{doctorId}/slots")
    public ResponseEntity<?> getAvailableSlotsForDate(@PathVariable int doctorId, @RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(doctorService.getAvailableSlotsForDate(doctorId, localDate));
    }

    // Cập nhật appointment
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(@PathVariable int id, @RequestBody AppointmentDTO appointmentDTO) {
        try {
            AppointmentDTO updatedAppointment = adminAppointmentService.updateAppointment(id, appointmentDTO);
            if (updatedAppointment == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedAppointment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Cập nhật status của appointment
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable int id, @RequestBody String status) {
        Appointment appointment = appointmentService.getAppointmentById(id);
        if (appointment == null) {
            return ResponseEntity.notFound().build();
        }

        appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok("Appointment status updated successfully");
    }

    // Xóa appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable int id) {
        boolean deleted = appointmentService.deleteAppointment(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok("Appointment deleted successfully");
    }

    // Lấy thống kê appointments
    @GetMapping("/stats")
    public ResponseEntity<AppointmentService.AppointmentStatsDTO> getAppointmentStats() {
        AppointmentService.AppointmentStatsDTO stats = appointmentService.getAppointmentStats();
        return ResponseEntity.ok(stats);
    }
}
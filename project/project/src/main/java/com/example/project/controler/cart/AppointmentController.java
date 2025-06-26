package com.example.project.controler.cart;

import com.example.project.dto.AppointmentRequestDTO;
import com.example.project.dto.AppointmentDTO;
import com.example.project.model.Appointment;
import com.example.project.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {
    @Autowired
    private AppointmentService appointmentService;

    // Lấy tất cả lịch hẹn của bác sĩ
    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getAppointmentsByDoctorId(@PathVariable int doctorId) {
        return appointmentService.getAppointmentsByDoctorId(doctorId);
    }

    // Lấy chi tiết lịch hẹn
    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable int id) {
        return appointmentService.getAppointmentById(id);
    }

    // Tạo mới lịch hẹn
    @PostMapping
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return appointmentService.createAppointment(appointment);
    }

    // Cập nhật trạng thái
    @PutMapping("/{id}/status")
    public void updateStatus(@PathVariable int id, @RequestParam String status) {
        appointmentService.updateAppointmentStatus(id, status);
    }

    // Lấy tất cả lịch hẹn của bác sĩ (trả về DTO)
    @GetMapping("/doctor/{doctorId}/dtos")
    public List<AppointmentDTO> getAppointmentDTOsByDoctorId(@PathVariable int doctorId) {
        return appointmentService.getAppointmentDTOsByDoctorId(doctorId);
    }
}


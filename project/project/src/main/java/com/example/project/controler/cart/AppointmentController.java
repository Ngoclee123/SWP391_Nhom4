package com.example.project.controler.cart;

<<<<<<< Updated upstream
import com.example.project.dto.AppointmentRequestDTO;
import com.example.project.dto.AppointmentDTO;
=======
>>>>>>> Stashed changes
import com.example.project.model.Appointment;
import com.example.project.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;


import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {
    @Autowired
    private AppointmentService appointmentService;

    // Lấy tất cả lịch hẹn của bác sĩ
    @GetMapping("/doctor/{doctorId}")
<<<<<<< Updated upstream
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

=======
    public List<Appointment> getAppointmentsByDoctor(@PathVariable Integer doctorId) {
        return appointmentService.getAppointmentsByDoctorId(doctorId);
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
>>>>>>> Stashed changes

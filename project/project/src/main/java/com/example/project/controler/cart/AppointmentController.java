package com.example.project.controler.cart;

import com.example.project.dto.AppointmentRequestDTO;
import com.example.project.model.Appointment;
import com.example.project.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody AppointmentRequestDTO requestDTO, @RequestHeader("userId") int userId) {
        Appointment appointment = appointmentService.createAppointment(userId, requestDTO);
        return ResponseEntity.ok(appointment);
    }
}

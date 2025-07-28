package com.example.project.controler;

import com.example.project.dto.DoctorAppointmentStatsDTO;
import com.example.project.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@RestController
@RequestMapping("/api/doctor-stats")
public class AppointmentStatsController {

    @Autowired
    private AppointmentService appointmentService;

    // API: /api/doctor-stats/{doctorId}/appointment
    @GetMapping("/{doctorId}/appointment")
    public DoctorAppointmentStatsDTO getDoctorAppointmentStats(@PathVariable Integer doctorId) {
        return appointmentService.getAppointmentStats(doctorId);
    }
}

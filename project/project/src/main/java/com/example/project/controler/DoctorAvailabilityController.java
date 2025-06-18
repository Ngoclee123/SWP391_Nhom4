package com.example.project.controler;

import com.example.project.dto.DoctorAvailabilityDTO;
import com.example.project.service.DoctorAvailabilityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor-availability")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorAvailabilityController {
    private static final Logger logger = LoggerFactory.getLogger(DoctorAvailabilityController.class);

    @Autowired
    private DoctorAvailabilityService doctorAvailabilityService;

    @GetMapping("/doctor/{doctorId}")
    public List<DoctorAvailabilityDTO> getByDoctorId(@PathVariable Integer doctorId) {
        logger.info("API /doctor/{} called", doctorId);
        return doctorAvailabilityService.getByDoctorId(doctorId);
    }

    @GetMapping("/doctor/{doctorId}/available")
    public List<DoctorAvailabilityDTO> getAvailableByDoctorId(@PathVariable Integer doctorId) {
        if (doctorId == null || doctorId <= 0) {
            throw new IllegalArgumentException("Invalid doctorId");
        }
        logger.info("API /doctor/{}/available called", doctorId);
        return doctorAvailabilityService.getAvailableByDoctorId(doctorId);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
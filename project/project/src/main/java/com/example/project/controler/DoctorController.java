package com.example.project.controler;

import com.example.project.dto.*;
import com.example.project.model.Doctor;
import com.example.project.model.Specialty;
import com.example.project.service.DoctorService;
import jakarta.validation.constraints.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@Validated
public class DoctorController {

    private static final Logger logger = LoggerFactory.getLogger(DoctorController.class);

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<DoctorSearchDTO>> getAllDoctors() {
        logger.info("Fetching all doctors");
        List<DoctorSearchDTO> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/{doctorId}")
    public ResponseEntity<DoctorSearchDTO> getDoctorById(@PathVariable Integer doctorId) {
        logger.info("Fetching doctor with ID: {}", doctorId);
        DoctorSearchDTO doctor = doctorService.getDoctorById(doctorId);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/specialties")
    public ResponseEntity<List<Specialty>> getAllSpecialties() {
        logger.info("Fetching all specialties");
        return ResponseEntity.ok(doctorService.getAllSpecialties());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<DoctorSearchDTO>> searchDoctors(
            @RequestParam(required = false) Integer specialtyId,
            @RequestParam(required = false) @Pattern(regexp = "^[\\p{L}\\s]*$", message = "Full name must contain only letters and spaces") String fullName,
            @RequestParam(required = false) @Pattern(regexp = "^(Available|Booked|Unavailable)?$", message = "Invalid availability status") String availabilityStatus,
            @RequestParam(required = false) @Pattern(regexp = "^[\\p{L}\\s]*$", message = "Location must contain only letters and spaces") String location,
            @RequestParam(required = false) String availabilityTime,
            Pageable pageable) {
        logger.info("Searching doctors with criteria: specialtyId={}, fullName={}, availabilityStatus={}, location={}, availabilityTime={}",
                specialtyId, fullName, availabilityStatus, location, availabilityTime);
        Page<DoctorSearchDTO> doctors = doctorService.searchDoctors(specialtyId, fullName, availabilityStatus, location, availabilityTime, pageable);
        return ResponseEntity.ok(doctors);
    }
    @GetMapping("/by-account/{accountId}")
    public ResponseEntity<DoctorSearchDTO> getDoctorByAccountId(@PathVariable Integer accountId) {
        logger.info("Fetching doctor by account ID: {}", accountId);
        DoctorSearchDTO doctor = doctorService.getDoctorByAccountId(accountId);
        return ResponseEntity.ok(doctor);
    }

}
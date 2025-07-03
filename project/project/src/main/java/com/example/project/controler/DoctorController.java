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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        List<Specialty> specialties = doctorService.getAllSpecialties();
        return ResponseEntity.ok(specialties);
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

    @GetMapping("/specialty/{specialtyId}/available")
    public ResponseEntity<List<DoctorSearchDTO>> getAvailableDoctorsBySpecialty(@PathVariable Integer specialtyId) {
        List<DoctorSearchDTO> doctors = doctorService.getAvailableDoctorsBySpecialty(specialtyId);
        if (doctors.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/specialty/{specialtyId}/all")
    public ResponseEntity<Map<String, Object>> getAllDoctorsBySpecialty(@PathVariable Integer specialtyId) {
        List<DoctorSearchDTO> doctors = doctorService.getAllDoctorsBySpecialty(specialtyId);
        Map<String, Object> response = new HashMap<>();
        if (doctors.isEmpty()) {
            response.put("data", List.of());
            response.put("message", "Không có bác sĩ nào trong chuyên khoa này.");
            return ResponseEntity.ok(response); // Trả về 200 với body rỗng và thông báo
        }
        response.put("data", doctors);
        response.put("message", "Danh sách bác sĩ đã được tải.");
        return ResponseEntity.ok(response);
    }
}
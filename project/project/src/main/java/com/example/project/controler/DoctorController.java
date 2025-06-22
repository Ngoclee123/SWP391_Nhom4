package com.example.project.controler;

import com.example.project.dto.DoctorSearchDTO;
import com.example.project.model.Doctor;
import com.example.project.model.Specialty;
import com.example.project.model.Certificate;
import com.example.project.service.DoctorService;
import com.example.project.repository.CertificateRepository;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.Valid;
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

    @Autowired
    private CertificateRepository certificateRepository;

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

    // ADMIN: Thêm mới bác sĩ (trả về kèm certificates)
    @PostMapping("")
    public ResponseEntity<?> createDoctor(@RequestBody @Valid Doctor doctor) {
        try {
            // if (doctor.getAccount() == null || doctor.getAccount().getId() == null) {
            //     return ResponseEntity.badRequest().body("Account is required");
            // }
            Doctor created = doctorService.saveDoctor(doctor);
            return ResponseEntity.status(201).body(created);
        } catch (Exception e) {
            logger.error("Error creating doctor: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error creating doctor: " + e.getMessage());
        }
    }

    // ADMIN: Cập nhật bác sĩ (trả về kèm certificates)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Integer id, @RequestBody Doctor doctor) {
        try {
            doctor.setId(id);
            Doctor updated = doctorService.saveDoctor(doctor);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating doctor: " + e.getMessage());
        }
    }

    // ADMIN: Lấy chi tiết bác sĩ kèm certificates
    @GetMapping("/entity/{id}")
    public ResponseEntity<?> getDoctorEntity(@PathVariable Integer id) {
        try {
            Doctor doctor = doctorService.getDoctorEntityById(id);
            return ResponseEntity.ok(doctor);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Doctor not found");
        }
    }

    // ADMIN: Xóa bác sĩ
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Integer id) {
        try {
            boolean deleted = doctorService.deleteDoctor(id);
            if (!deleted) {
                return ResponseEntity.status(404).body("Doctor not found");
            }
            return ResponseEntity.ok("Doctor deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting doctor: " + e.getMessage());
        }
    }

    // ADMIN: API lấy danh sách chứng chỉ
    @GetMapping("/certificates")
    public ResponseEntity<List<Certificate>> getAllCertificates() {
        return ResponseEntity.ok(certificateRepository.findAll());
    }

}
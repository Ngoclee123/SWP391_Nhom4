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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import java.util.List;
import java.time.Instant;

@RestController
@RequestMapping("/api/doctors")
@Validated
public class DoctorController {

    private static final Logger logger = LoggerFactory.getLogger(DoctorController.class);

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private CertificateRepository certificateRepository;

    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }
            String fileName = System.currentTimeMillis() + "_" + org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());

            // Dò lên tối đa 6 cấp để tìm thư mục front-end/public/avatars
            java.nio.file.Path current = java.nio.file.Paths.get(System.getProperty("user.dir")).toAbsolutePath();
            java.nio.file.Path avatarsDir = null;
            for (int i = 0; i < 6; i++) {
                java.nio.file.Path tryPath = current.resolveSibling("front-end/public/avatars").normalize();
                if (java.nio.file.Files.exists(tryPath.getParent())) {
                    avatarsDir = tryPath;
                    break;
                }
                current = current.getParent();
            }
            if (avatarsDir == null) {
                return ResponseEntity.status(500).body("Không tìm thấy thư mục front-end/public/avatars");
            }
            if (!java.nio.file.Files.exists(avatarsDir)) {
                java.nio.file.Files.createDirectories(avatarsDir);
            }
            java.nio.file.Path avatarFilePath = avatarsDir.resolve(fileName);
            java.nio.file.Files.copy(file.getInputStream(), avatarFilePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Log đường dẫn thực tế để debug
            System.out.println("Avatar saved to: " + avatarFilePath.toAbsolutePath());

            String avatarFileUrl = "/avatars/" + fileName;
            return ResponseEntity.ok().body(avatarFileUrl);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/specialties")
    public ResponseEntity<List<Specialty>> getAllSpecialties() {
        logger.info("Fetching all specialties");
        return ResponseEntity.ok(doctorService.getAllSpecialties());
    }

    @GetMapping("/certificates")
    public ResponseEntity<List<Certificate>> getAllCertificates() {
        return ResponseEntity.ok(certificateRepository.findAll());
    }

    @GetMapping("/{doctorId}")
    public ResponseEntity<DoctorSearchDTO> getDoctorById(@PathVariable Integer doctorId) {
        logger.info("Fetching doctor with ID: {}", doctorId);
        DoctorSearchDTO doctor = doctorService.getDoctorById(doctorId);
        return ResponseEntity.ok(doctor);
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
            if (doctor.getCreatedAt() == null) {
                doctor.setCreatedAt(Instant.now());
            }
            System.out.println("Doctor imgs: " + doctor.getImgs());
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
            System.out.println("Doctor imgs: " + doctor.getImgs());
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

}
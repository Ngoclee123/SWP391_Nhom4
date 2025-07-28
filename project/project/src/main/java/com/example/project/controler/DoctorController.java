//package com.example.project.controler;
//
//import com.example.project.dto.DoctorSearchDTO;
//import com.example.project.dto.SlotDTO;
//import com.example.project.model.Doctor;
//import com.example.project.model.Specialty;
//import com.example.project.service.AdminManagementDoctorService;
//import com.example.project.service.DoctorService;
//import jakarta.validation.Valid;
//import jakarta.validation.constraints.Pattern;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.format.annotation.DateTimeFormat;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.validation.annotation.Validated;
//import org.springframework.web.bind.annotation.*;
//
//import java.time.Instant;
//import java.time.LocalDate;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/doctors")
//@Validated
//public class DoctorController {
//
//    private static final Logger logger = LoggerFactory.getLogger(DoctorController.class);
//
//    @Autowired
//    private DoctorService doctorService;
//
//    @Autowired
//    private AdminManagementDoctorService  adminManagementDoctorService;
//////Quang
////    @GetMapping("/{doctorId}")
////    public ResponseEntity<DoctorSearchDTO> getDoctorId(@PathVariable Integer doctorId) {
////        logger.info("Fetching doctor with ID: {}", doctorId);
////        DoctorSearchDTO doctor = doctorService.getDoctorById(doctorId);
////        return ResponseEntity.ok(doctor);
////    }
//
//
//
//    @GetMapping("/special")
//    public ResponseEntity<List<Specialty>> getAllSpecial() {
//        logger.info("Fetching all specialties");
//        return ResponseEntity.ok(doctorService.getAllSpecialties());
//    }
////Khanh
//    @GetMapping("/by-account/{accountId}")
//    public ResponseEntity<DoctorSearchDTO> getDoctorByAccountId(@PathVariable Integer accountId) {
//        logger.info("Fetching doctor by account ID: {}", accountId);
//        DoctorSearchDTO doctor = doctorService.getDoctorByAccountId(accountId);
//        return ResponseEntity.ok(doctor);
//    }
//
//    @GetMapping("/specialty/{specialtyId}/available")
//    public ResponseEntity<List<DoctorSearchDTO>> getAvailableDoctorsBySpecialty(@PathVariable Integer specialtyId) {
//        List<DoctorSearchDTO> doctors = doctorService.getAvailableDoctorsBySpecialty(specialtyId);
//        if (doctors.isEmpty()) {
//            return ResponseEntity.noContent().build();
//        }
//        return ResponseEntity.ok(doctors);
//    }
//
//    @GetMapping("/specialty/{specialtyId}/all")
//    public ResponseEntity<Map<String, Object>> getAllDoctorsBySpecialty(@PathVariable Integer specialtyId) {
//        List<DoctorSearchDTO> doctors = doctorService.getAllDoctorsBySpecialty(specialtyId);
//        Map<String, Object> response = new HashMap<>();
//        if (doctors.isEmpty()) {
//            response.put("data", List.of());
//            response.put("message", "Không có bác sĩ nào trong chuyên khoa này.");
//            return ResponseEntity.ok(response); // Trả về 200 với body rỗng và thông báo
//        }
//        response.put("data", doctors);
//        response.put("message", "Danh sách bác sĩ đã được tải.");
//        return ResponseEntity.ok(response);
//    }
//
//    @GetMapping("/search")
//    public ResponseEntity<Page<DoctorSearchDTO>> searchDoctors(
//            @RequestParam(required = false) Integer specialtyId,
//            @RequestParam(required = false) @Pattern(regexp = "^[\\p{L}\\s]*$", message = "Full name must contain only letters and spaces") String fullName,
//            @RequestParam(required = false) @Pattern(regexp = "^(Available|Booked|Unavailable)?$", message = "Invalid availability status") String availabilityStatus,
//            @RequestParam(required = false) @Pattern(regexp = "^[\\p{L}\\s]*$", message = "Location must contain only letters and spaces") String location,
//            @RequestParam(required = false) String availabilityTime,
//            Pageable pageable) {
//        logger.info("Searching doctors with criteria: specialtyId={}, fullName={}, availabilityStatus={}, location={}, availabilityTime={}",
//                specialtyId, fullName, availabilityStatus, location, availabilityTime);
//        Page<DoctorSearchDTO> doctors = doctorService.searchDoctors(specialtyId, fullName, availabilityStatus, location, availabilityTime, pageable);
//        return ResponseEntity.ok(doctors);
//    }
//
//
////Ngọc
//    @GetMapping
//    public ResponseEntity<Map<String, Object>> getAllDoctors() {
//        logger.info("GET request to /api/doctors");
//        try {
//            Map<String, Object> response = doctorService.getAllDoctors();
//
//            if (response.containsKey("error")) {
//                logger.error("Error in service layer: {}", response.get("error"));
//                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//            }
//
//            if (response.containsKey("data")) {
//                List<?> doctors = (List<?>) response.get("data");
//                if (doctors.isEmpty()) {
//                    logger.info("No doctors found");
//                    Map<String, Object> emptyResponse = new HashMap<>();
//                    emptyResponse.put("data", doctors);
//                    emptyResponse.put("message", "Không có bác sĩ nào trong danh sách");
//                    return ResponseEntity.ok(emptyResponse);
//                }
//                logger.info("Successfully retrieved {} doctors", doctors.size());
//                return ResponseEntity.ok(response);
//            }
//
//            logger.error("Invalid response format from service");
//            Map<String, Object> errorResponse = new HashMap<>();
//            errorResponse.put("error", "Lỗi định dạng dữ liệu");
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//        } catch (Exception e) {
//            logger.error("Unexpected error in getAllDoctors: {}", e.getMessage());
//            Map<String, Object> errorResponse = new HashMap<>();
//            errorResponse.put("error", "Đã xảy ra lỗi không mong muốn");
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//        }
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<?> getDoctorById(@PathVariable Integer id) {
//        logger.info("GET request to /api/doctors/{}", id);
//        try {
//            DoctorSearchDTO doctor = doctorService.getDoctorById(id);
//            if (doctor == null) {
//                logger.error("Doctor not found with ID: {}", id);
//                Map<String, String> response = new HashMap<>();
//                response.put("error", "Không tìm thấy bác sĩ");
//                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
//            }
//            return ResponseEntity.ok(doctor);
//        } catch (Exception e) {
//            logger.error("Error fetching doctor with ID {}: {}", id, e.getMessage());
//            Map<String, String> response = new HashMap<>();
//            response.put("error", "Không thể tải thông tin bác sĩ");
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//        }
//    }
//
//    @GetMapping("/specialties")
//    public ResponseEntity<?> getAllSpecialties() {
//        logger.info("GET request to /api/doctors/specialties");
//        try {
//            List<Specialty> specialties = doctorService.getAllSpecialties();
//            if (specialties.isEmpty()) {
//                logger.info("No specialties found");
//                Map<String, String> response = new HashMap<>();
//                response.put("message", "Không có chuyên khoa nào");
//                return ResponseEntity.ok(response);
//            }
//            return ResponseEntity.ok(specialties);
//        } catch (Exception e) {
//            logger.error("Error fetching specialties: {}", e.getMessage());
//            Map<String, String> response = new HashMap<>();
//            response.put("error", "Không thể tải danh sách chuyên khoa");
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//        }
//    }
//    @GetMapping("/{id}/available-slots")
//    public ResponseEntity<?> getAvailableSlots(
//            @PathVariable Integer id,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
//
//        logger.info("GET request to /api/doctors/{}/available-slots for date: {}", id, date);
//
//        try {
//            List<SlotDTO> slots = doctorService.getAvailableSlotsForDate(id, date);
//
//            if (slots.isEmpty()) {
//                logger.info("No available slots found for doctor {} on date {}", id, date);
//                Map<String, String> response = new HashMap<>();
//                response.put("message", "Không có lịch trống cho ngày đã chọn");
//                return ResponseEntity.ok(response);
//            }
//
//            return ResponseEntity.ok(slots);
//        } catch (Exception e) {
//            logger.error("Error fetching available slots for doctor {} on date {}: {}", id, date, e.getMessage());
//            Map<String, String> response = new HashMap<>();
//            response.put("error", "Không thể tải lịch trống");
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//        }
//    }
//
//
//
//
//    @GetMapping("/online")
//    public ResponseEntity<List<Doctor>> getOnlineDoctors() {
//        List<Doctor> onlineDoctors = adminManagementDoctorService.getOnlineDoctors();
//        return ResponseEntity.ok(onlineDoctors);
//    }
//
//    // ADMIN: Thêm mới bác sĩ (trả về kèm certificates)
//    @PostMapping("")
//    public ResponseEntity<?> createDoctor(@RequestBody @Valid Doctor doctor) {
//        try {
//            // if (doctor.getAccount() == null || doctor.getAccount().getId() == null) {
//            //     return ResponseEntity.badRequest().body("Account is required");
//            // }
//            if (doctor.getCreatedAt() == null) {
//                doctor.setCreatedAt(Instant.now());
//            }
//            System.out.println("Doctor imgs: " + doctor.getImgs());
//            Doctor created = adminManagementDoctorService.saveDoctor(doctor);
//            return ResponseEntity.status(201).body(created);
//        } catch (Exception e) {
//            logger.error("Error creating doctor: {}", e.getMessage());
//            return ResponseEntity.status(500).body("Error creating doctor: " + e.getMessage());
//        }
//    }
//
//    // ADMIN: Cập nhật bác sĩ (trả về kèm certificates)
//    @PutMapping("/{id}")
//    public ResponseEntity<?> updateDoctor(@PathVariable Integer id, @RequestBody Doctor doctor) {
//        try {
//            doctor.setId(id);
//            System.out.println("Doctor imgs: " + doctor.getImgs());
//            Doctor updated = adminManagementDoctorService.saveDoctor(doctor);
//            return ResponseEntity.ok(updated);
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("Error updating doctor: " + e.getMessage());
//        }
//    }
//
//    // ADMIN: Lấy chi tiết bác sĩ kèm certificates
//    @GetMapping("/entity/{id}")
//    public ResponseEntity<?> getDoctorEntity(@PathVariable Integer id) {
//        try {
//            Doctor doctor = adminManagementDoctorService.getDoctorEntityById(id);
//            return ResponseEntity.ok(doctor);
//        } catch (Exception e) {
//            return ResponseEntity.status(404).body("Doctor not found");
//        }
//    }
//
//    // ADMIN: Xóa bác sĩ
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> deleteDoctor(@PathVariable Integer id) {
//        try {
//            boolean deleted = adminManagementDoctorService.deleteDoctor(id);
//            if (!deleted) {
//                return ResponseEntity.status(404).body("Doctor not found");
//            }
//            return ResponseEntity.ok("Doctor deleted successfully");
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("Error deleting doctor: " + e.getMessage());
//        }
//    }
//
//}



package com.example.project.controler;

import com.example.project.dto.DoctorSearchDTO;
import com.example.project.dto.SlotDTO;
import com.example.project.model.Doctor;
import com.example.project.model.Specialty;
import com.example.project.service.AdminManagementDoctorService;
import com.example.project.service.DoctorService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

@RestController
@RequestMapping("/api/doctors")
@Validated
public class DoctorController {

    private static final Logger logger = LoggerFactory.getLogger(DoctorController.class);

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AdminManagementDoctorService  adminManagementDoctorService;
    ////Quang
//    @GetMapping("/{doctorId}")
//    public ResponseEntity<DoctorSearchDTO> getDoctorId(@PathVariable Integer doctorId) {
//        logger.info("Fetching doctor with ID: {}", doctorId);
//        DoctorSearchDTO doctor = doctorService.getDoctorById(doctorId);
//        return ResponseEntity.ok(doctor);
//    }



    @GetMapping("/special")
    public ResponseEntity<List<Specialty>> getAllSpecial() {
        logger.info("Fetching all specialties");
        return ResponseEntity.ok(doctorService.getAllSpecialties());
    }
    //Khanh
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


    //Ngọc
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllDoctors() {
        logger.info("GET request to /api/doctors");
        try {
            Map<String, Object> response = doctorService.getAllDoctors();

            if (response.containsKey("error")) {
                logger.error("Error in service layer: {}", response.get("error"));
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

            if (response.containsKey("data")) {
                List<?> doctors = (List<?>) response.get("data");
                if (doctors.isEmpty()) {
                    logger.info("No doctors found");
                    Map<String, Object> emptyResponse = new HashMap<>();
                    emptyResponse.put("data", doctors);
                    emptyResponse.put("message", "Không có bác sĩ nào trong danh sách");
                    return ResponseEntity.ok(emptyResponse);
                }
                logger.info("Successfully retrieved {} doctors", doctors.size());
                return ResponseEntity.ok(response);
            }

            logger.error("Invalid response format from service");
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi định dạng dữ liệu");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        } catch (Exception e) {
            logger.error("Unexpected error in getAllDoctors: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Đã xảy ra lỗi không mong muốn");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Integer id) {
        logger.info("GET request to /api/doctors/{}", id);
        try {
            DoctorSearchDTO doctor = doctorService.getDoctorById(id);
            if (doctor == null) {
                logger.error("Doctor not found with ID: {}", id);
                Map<String, String> response = new HashMap<>();
                response.put("error", "Không tìm thấy bác sĩ");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            return ResponseEntity.ok(doctor);
        } catch (Exception e) {
            logger.error("Error fetching doctor with ID {}: {}", id, e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Không thể tải thông tin bác sĩ");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/specialties")
    public ResponseEntity<?> getAllSpecialties() {
        logger.info("GET request to /api/doctors/specialties");
        try {
            List<Specialty> specialties = doctorService.getAllSpecialties();
            if (specialties.isEmpty()) {
                logger.info("No specialties found");
                Map<String, String> response = new HashMap<>();
                response.put("message", "Không có chuyên khoa nào");
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.ok(specialties);
        } catch (Exception e) {
            logger.error("Error fetching specialties: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Không thể tải danh sách chuyên khoa");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    @GetMapping("/{id}/available-slots")
    public ResponseEntity<?> getAvailableSlots(
            @PathVariable Integer id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        logger.info("GET request to /api/doctors/{}/available-slots for date: {}", id, date);

        try {
            List<SlotDTO> slots = doctorService.getAvailableSlotsForDate(id, date);

            if (slots.isEmpty()) {
                logger.info("No available slots found for doctor {} on date {}", id, date);
                Map<String, String> response = new HashMap<>();
                response.put("message", "Không có lịch trống cho ngày đã chọn");
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            logger.error("Error fetching available slots for doctor {} on date {}: {}", id, date, e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Không thể tải lịch trống");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }




    @GetMapping("/online")
    public ResponseEntity<List<DoctorSearchDTO>> getOnlineDoctors() {
        logger.info("GET request to /api/doctors/online");
        try {
            List<Doctor> onlineDoctors = adminManagementDoctorService.getOnlineDoctors();
            List<DoctorSearchDTO> onlineDoctorDTOs = onlineDoctors.stream()
                    .map(doctor -> {
                        DoctorSearchDTO dto = new DoctorSearchDTO();
                        dto.setId(doctor.getId());
                        dto.setFullName(doctor.getFullName());
                        dto.setSpecialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null);
                        dto.setStatus(doctor.getStatus());
                        return dto;
                    })
                    .collect(java.util.stream.Collectors.toList());

            logger.info("Found {} online doctors", onlineDoctorDTOs.size());
            return ResponseEntity.ok(onlineDoctorDTOs);
        } catch (Exception e) {
            logger.error("Error fetching online doctors: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ADMIN: Thêm mới bác sĩ (trả về kèm certificates)
    @PostMapping("")
    public ResponseEntity<?> createDoctor(@RequestBody @Valid com.example.project.dto.DoctorDTO doctor) {
        try {
            // Không cần set createdAt ở đây, service sẽ tự xử lý
            Doctor created = adminManagementDoctorService.saveDoctor(doctor);
            DoctorSearchDTO dto = adminManagementDoctorService.getDoctorById(created.getId());
            return ResponseEntity.status(201).body(dto);
        } catch (Exception e) {
            logger.error("Error creating doctor: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error creating doctor: " + e.getMessage());
        }
    }

    // ADMIN: Cập nhật bác sĩ (trả về kèm certificates)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Integer id, @RequestBody com.example.project.dto.DoctorDTO doctor) {
        try {
            doctor.setId(id);
            System.out.println("Doctor imgs: " + doctor.getImgs());
            Doctor updated = adminManagementDoctorService.saveDoctor(doctor);
            // Trả về DTO thay vì entity
            DoctorSearchDTO dto = adminManagementDoctorService.getDoctorById(updated.getId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating doctor: " + e.getMessage());
        }
    }

    // ADMIN: Lấy chi tiết bác sĩ kèm certificates
    @GetMapping("/entity/{id}")
    public ResponseEntity<?> getDoctorEntity(@PathVariable Integer id) {
        try {
            DoctorSearchDTO dto = adminManagementDoctorService.getDoctorById(id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Doctor not found");
        }
    }

    // ADMIN: Xóa bác sĩ
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Integer id) {
        try {
            boolean deleted = adminManagementDoctorService.deleteDoctor(id);
            if (!deleted) {
                return ResponseEntity.status(404).body("Doctor not found");
            }
            return ResponseEntity.ok("Doctor deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting doctor: " + e.getMessage());
        }
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }
            
            String fileName = System.currentTimeMillis() + "_" + org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());

            // Tìm thư mục avatars một cách an toàn
            java.nio.file.Path current = java.nio.file.Paths.get(System.getProperty("user.dir")).toAbsolutePath();
            java.nio.file.Path avatarsDir = null;
            
            // Thử các đường dẫn có thể có
            String[] possiblePaths = {
                current.resolve("front-end/public/avatars").toString(),
                current.resolve("../front-end/public/avatars").toString(),
                current.resolve("../../front-end/public/avatars").toString(),
                current.resolve("avatars").toString()
            };
            
            for (String path : possiblePaths) {
                java.nio.file.Path testPath = java.nio.file.Paths.get(path);
                if (java.nio.file.Files.exists(testPath.getParent())) {
                    avatarsDir = testPath;
                    break;
                }
            }
            
            if (avatarsDir == null) {
                // Fallback: tạo thư mục avatars trong thư mục hiện tại
                avatarsDir = current.resolve("avatars");
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
            logger.error("Error uploading avatar: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
package com.example.project.controler;

import com.example.project.dto.DoctorSearchDTO;
import com.example.project.dto.SlotDTO;
import com.example.project.model.Specialty;
import com.example.project.service.DoctorService;
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

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@Validated
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorController {

    private static final Logger logger = LoggerFactory.getLogger(DoctorController.class);

    @Autowired
    private DoctorService doctorService;

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

    @GetMapping("/search")
    public ResponseEntity<?> searchDoctors(
            @RequestParam(required = false) Integer specialtyId,
            @RequestParam(required = false) @Pattern(regexp = "^[\\p{L}\\s]*$", message = "Tên chỉ được chứa chữ cái và khoảng trắng") String fullName,
            @RequestParam(required = false) @Pattern(regexp = "^(Available|Booked|Unavailable)?$", message = "Trạng thái không hợp lệ") String availabilityStatus,
            @RequestParam(required = false) @Pattern(regexp = "^[\\p{L}\\s]*$", message = "Địa điểm chỉ được chứa chữ cái và khoảng trắng") String location,
            @RequestParam(required = false) String availabilityTime,
            Pageable pageable) {
        
        logger.info("GET request to /api/doctors/search with params: specialtyId={}, fullName={}, status={}, location={}, time={}",
                specialtyId, fullName, availabilityStatus, location, availabilityTime);
        
        try {
            Page<DoctorSearchDTO> doctors = doctorService.searchDoctors(
                    specialtyId, fullName, availabilityStatus, location, availabilityTime, pageable);
            
            if (doctors.isEmpty()) {
                logger.info("No doctors found matching search criteria");
                Map<String, String> response = new HashMap<>();
                response.put("message", "Không tìm thấy bác sĩ nào phù hợp với tiêu chí tìm kiếm");
                return ResponseEntity.ok(response);
            }
            
            return ResponseEntity.ok(doctors);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid search parameters: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Thông tin tìm kiếm không hợp lệ");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            logger.error("Error searching doctors: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Không thể thực hiện tìm kiếm");
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
}
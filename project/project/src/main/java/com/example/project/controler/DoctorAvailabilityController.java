package com.example.project.controler;

import com.example.project.dto.DoctorAvailabilityDTO;
import com.example.project.service.DoctorAvailabilityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.example.project.dto.DoctorAvailabilitySlotRequest;

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

    @GetMapping("/doctor/{doctorId}/paginated")
    public Page<DoctorAvailabilityDTO> getByDoctorIdPaginated(
            @PathVariable Integer doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("API /doctor/{}/paginated called with page={}, size={}", doctorId, page, size);
        Pageable pageable = PageRequest.of(page, size);
        return doctorAvailabilityService.getByDoctorIdPaginated(doctorId, pageable);
    }

    @GetMapping("/doctor/{doctorId}/available")
    public List<DoctorAvailabilityDTO> getAvailableByDoctorId(@PathVariable Integer doctorId) {
        if (doctorId == null || doctorId <= 0) {
            throw new IllegalArgumentException("Invalid doctorId");
        }
        logger.info("API /doctor/{}/available called", doctorId);
        return doctorAvailabilityService.getAvailableByDoctorId(doctorId);
    }

    @PostMapping("/doctor/{doctorId}/add")
    public ResponseEntity<?> createAvailability(@PathVariable Integer doctorId, @RequestBody DoctorAvailabilityDTO dto) {
        DoctorAvailabilityDTO created = doctorAvailabilityService.createAvailability(doctorId, dto);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/doctor/{doctorId}/add-slots")
    public ResponseEntity<?> createAvailabilitySlots(@PathVariable Integer doctorId, @RequestBody DoctorAvailabilitySlotRequest request) {
        List<DoctorAvailabilityDTO> created = doctorAvailabilityService.createAvailabilitySlots(doctorId, request);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAvailability(@PathVariable Integer id, @RequestBody DoctorAvailabilityDTO dto) {
        DoctorAvailabilityDTO updated = doctorAvailabilityService.updateAvailability(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAvailability(@PathVariable Integer id) {
        doctorAvailabilityService.deleteAvailability(id);
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
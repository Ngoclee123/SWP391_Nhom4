package com.example.project.controler;

import com.example.project.dto.DoctorAvailabilityDTO;
import com.example.project.service.DoctorAvailabilityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
    public ResponseEntity<?> createAvailabilitySlots(@PathVariable Integer doctorId, @RequestBody DoctorAvailabilitySlotRequest req) {
        doctorAvailabilityService.createAvailabilitySlotsByProcedure(
            doctorId, req.getStartTime(), req.getEndTime(), req.getSlotMinutes()
        );
        return ResponseEntity.ok("Inserted slots successfully");
    }

    @PutMapping("/{availabilityId}")
    public ResponseEntity<?> updateAvailability(@PathVariable Integer availabilityId, @RequestBody DoctorAvailabilityDTO dto) {
        DoctorAvailabilityDTO updated = doctorAvailabilityService.updateAvailability(availabilityId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{availabilityId}")
    public ResponseEntity<?> deleteAvailability(@PathVariable Integer availabilityId) {
        doctorAvailabilityService.deleteAvailability(availabilityId);
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
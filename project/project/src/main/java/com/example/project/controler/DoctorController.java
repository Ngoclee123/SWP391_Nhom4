package com.example.project.controler;

import com.example.project.dto.DoctorSearchDTO;
import com.example.project.model.Specialty;
import com.example.project.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping("/{doctorId}")
    public ResponseEntity<DoctorSearchDTO> getDoctorById(@PathVariable Integer doctorId) {
        DoctorSearchDTO doctor = doctorService.getDoctorById(doctorId);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/specialties")
    public ResponseEntity<List<Specialty>> getAllSpecialties() {
        System.out.println("Returning specialties: " + doctorService.getAllSpecialties());
        return ResponseEntity.ok(doctorService.getAllSpecialties());
    }

    @GetMapping("/search")
    public ResponseEntity<List<DoctorSearchDTO>> searchDoctors(
            @RequestParam(required = false) Integer specialtyId,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String availabilityStatus,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String availabilityTime) {
        List<DoctorSearchDTO> doctors = doctorService.searchDoctors(specialtyId, fullName, availabilityStatus, location, availabilityTime);
        return ResponseEntity.ok(doctors);
    }
}
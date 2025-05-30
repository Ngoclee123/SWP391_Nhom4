package com.example.project.controler;
import com.example.project.dto.DoctorSearchDTO;
import com.example.project.model.Doctor;
import com.example.project.model.Specialty;
import com.example.project.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping("/search")
    public ResponseEntity<List<Doctor>> searchDoctors(
            @RequestParam(value = "specialtyId", required = false) Integer specialtyId,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "availabilityStatus", required = false) String availabilityStatus,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "availabilityTime", required = false) String availabilityTime) {

        List<Doctor> doctors = doctorService.searchDoctors(specialtyId, fullName, availabilityStatus, location, availabilityTime);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/specialties")
    public ResponseEntity<List<Specialty>> getAllSpecialties() {
        List<Specialty> specialties = doctorService.getAllSpecialties();
        return ResponseEntity.ok(specialties);
    }
}

package com.example.project.controler.admin;

import com.example.project.model.Patient;
import com.example.project.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class AdminPatientStatsController {
    @Autowired
    private PatientRepository patientRepository;

    // Endpoint tuyệt đối cho FE: /api/admin/patient-stats
    @GetMapping("/api/admin/patient-stats")
    public ResponseEntity<?> getPatientStats() {
        List<Patient> all = patientRepository.findAll();
        int total = all.size();
        long male = all.stream().filter(p -> "Male".equalsIgnoreCase(p.getGender()) || "Nam".equalsIgnoreCase(p.getGender())).count();
        long female = all.stream().filter(p -> "Female".equalsIgnoreCase(p.getGender()) || "Nữ".equalsIgnoreCase(p.getGender())).count();
        Map<Integer, Long> byYear = all.stream()
            .filter(p -> p.getDateOfBirth() != null)
            .collect(java.util.stream.Collectors.groupingBy(
                p -> p.getDateOfBirth().getYear(), java.util.stream.Collectors.counting()
            ));
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("total", total);
        result.put("male", male);
        result.put("female", female);
        result.put("byYear", byYear);
        return ResponseEntity.ok(result);
    }
} 
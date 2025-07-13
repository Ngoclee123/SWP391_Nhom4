package com.example.project.controler.vacin;

import com.example.project.dto.PatientDTO;
import com.example.project.model.Patient;
import com.example.project.repository.PatientRepository;
import com.example.project.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminPatientController {
    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PatientService patientService;

    @GetMapping("/patients")
    // @PreAuthorize("hasRole('ADMIN')")

    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();
        List<PatientDTO> dtos = patients.stream().map(PatientDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/patient-stats")
    public ResponseEntity<PatientService.PatientStatsDTO> getPatientStats() {
        return ResponseEntity.ok(patientService.getPatientStats());
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        try {
            // Check if patient exists
            Patient existingPatient = patientRepository.findById(id.intValue()).orElse(null);
            if (existingPatient == null) {
                return ResponseEntity.status(404).body("Patient not found");
            }

            boolean deleted = patientService.deletePatient(id);
            if (deleted) {
                return ResponseEntity.ok("Patient deleted successfully");
            } else {
                return ResponseEntity.status(500).body("Failed to delete patient");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting patient: " + e.getMessage());
        }
    }
}

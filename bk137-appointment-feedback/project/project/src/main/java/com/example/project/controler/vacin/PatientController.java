package com.example.project.controler.vacin;

import com.example.project.dto.PatientDTO;
import com.example.project.model.Patient;
import com.example.project.repository.PatientRepository;
import com.example.project.service.ParentService;
import com.example.project.service.PatientService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController("vacinPatientController")
@RequestMapping("/api/parents")
public class PatientController {

    private static final Logger logger = LoggerFactory.getLogger(PatientController.class);

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ParentService parentService;

    @Autowired
    private PatientService patientService;

    @GetMapping("/patients")
    public ResponseEntity<List<PatientDTO>> getPatientsByParent() {
        logger.debug("Processing /api/parents/patients request");
        try {
            // Temporarily return all patients since authentication is disabled
            List<Patient> patients = patientRepository.findAll();
            if (patients.isEmpty()) {
                logger.warn("No patients found");
                return ResponseEntity.noContent().build();
            }
            logger.debug("Found {} patients", patients.size());

            List<PatientDTO> patientDTOs = patients.stream()
                    .map(PatientDTO::new)
                    .collect(Collectors.toList());
            logger.debug("Returning {} patient DTOs: {}", patientDTOs.size(), patientDTOs);
            return ResponseEntity.ok(patientDTOs);

        } catch (Exception e) {
            logger.error("Error fetching patients: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/patients")
    public ResponseEntity<PatientDTO> addPatient(@RequestBody PatientDTO patientDTO) {
        logger.debug("Processing /api/parents/patients POST request with patientDTO: {}", patientDTO);
        try {
            // Temporarily use a default username since authentication is disabled
            String username = "default_user";
            logger.debug("Using default username: {}", username);

            PatientDTO savedPatientDTO = patientService.addPatient(patientDTO, username);
            logger.debug("Patient added successfully with id: {}", savedPatientDTO.getId());
            logger.debug("Returning patient DTO: {}", savedPatientDTO);
            return ResponseEntity.status(201).body(savedPatientDTO);
        } catch (Exception e) {
            logger.error("Error adding patient: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/patients/{id}")
    public ResponseEntity<PatientDTO> updatePatient(@PathVariable Long id, @RequestBody PatientDTO patientDTO) {
        logger.debug("Processing /api/parents/patients/{} PUT request with patientDTO: {}", id, patientDTO);
        try {
            // Check if patient exists
            Patient existingPatient = patientRepository.findById(id.intValue()).orElse(null);
            if (existingPatient == null) {
                logger.error("Patient not found with id: {}", id);
                return ResponseEntity.status(404).body(null);
            }

            PatientDTO updatedPatientDTO = patientService.updatePatient(id, patientDTO);
            logger.debug("Patient updated successfully with id: {}", updatedPatientDTO.getId());
            logger.debug("Returning updated patient DTO: {}", updatedPatientDTO);
            return ResponseEntity.ok(updatedPatientDTO);
        } catch (Exception e) {
            logger.error("Error updating patient: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        logger.debug("Processing /api/parents/patients/{} DELETE request", id);
        try {
            // Check if patient exists
            Patient existingPatient = patientRepository.findById(id.intValue()).orElse(null);
            if (existingPatient == null) {
                logger.error("Patient not found with id: {}", id);
                return ResponseEntity.status(404).body("Patient not found");
            }

            boolean deleted = patientService.deletePatient(id);
            if (deleted) {
                logger.debug("Patient deleted successfully with id: {}", id);
                return ResponseEntity.ok("Patient deleted successfully");
            } else {
                logger.error("Failed to delete patient with id: {}", id);
                return ResponseEntity.status(500).body("Failed to delete patient");
            }
        } catch (Exception e) {
            logger.error("Error deleting patient: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error deleting patient: " + e.getMessage());
        }
    }
}
<<<<<<< HEAD
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

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
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
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PatientDTO>> getPatientsByParent() {
        logger.debug("Processing /api/parents/patients request");
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.error("No authenticated user found");
                return ResponseEntity.status(401).body(null);
            }

            String username = authentication.getName();
            logger.debug("Authenticated username: {}", username);

            Integer parentId = parentService.getParentIdByUsername(username);
            logger.debug("Parent ID for username {}: {}", username, parentId);
            if (parentId == null) {
                logger.error("No parentId found for username: {}", username);
                return ResponseEntity.status(404).body(null);
            }

            List<Patient> patients = patientRepository.findByParentId(parentId);
            if (patients.isEmpty()) {
                logger.warn("No patients found for parentId: {}", parentId);
                return ResponseEntity.noContent().build();
            }
            logger.debug("Found {} patients for parentId: {}", patients.size(), parentId);

            List<PatientDTO> patientDTOs = patients.stream()
                    .map(PatientDTO::new) // Sử dụng constructor mới
                    .collect(Collectors.toList());
            logger.debug("Returning {} patient DTOs: {}", patientDTOs.size(), patientDTOs);
            return ResponseEntity.ok(patientDTOs);

        } catch (Exception e) {
            logger.error("Error fetching patients: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/patients")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PatientDTO> addPatient(@RequestBody PatientDTO patientDTO) {
        logger.debug("Processing /api/parents/patients POST request with patientDTO: {}", patientDTO);
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.error("No authenticated user found");
                return ResponseEntity.status(401).body(null);
            }

            String username = authentication.getName();
            logger.debug("Authenticated username: {}", username);

            // Chuyển accountId từ String sang Integer
            Integer accountId;
            try {
                accountId = patientDTO.getAccountId();
                if (accountId == null) {
                    logger.error("accountId is null in patientDTO");
                    return ResponseEntity.badRequest().body(null);
                }
            } catch (NumberFormatException e) {
                logger.error("Invalid accountId format: {}", patientDTO.getAccountId(), e);
                return ResponseEntity.badRequest().body(null);
            }

            // Parse dateOfBirth từ String sang LocalDate (nếu cần)
            if (patientDTO.getDateOfBirth() == null) {
                logger.error("dateOfBirth is null in patientDTO");
                return ResponseEntity.badRequest().body(null);
            }

            PatientDTO savedPatientDTO = patientService.addPatient(patientDTO, accountId);
            logger.debug("Patient added successfully with id: {}", savedPatientDTO.getId());
            return ResponseEntity.status(201).body(savedPatientDTO);
        } catch (Exception e) {
            logger.error("Error adding patient: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }
=======
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

@RestController
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
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PatientDTO>> getPatientsByParent() {
        logger.debug("Processing /api/parents/patients request");
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.error("No authenticated user found");
                return ResponseEntity.status(401).body(null);
            }

            String username = authentication.getName();
            logger.debug("Authenticated username: {}", username);

            Integer parentId = parentService.getParentIdByUsername(username);
            logger.debug("Parent ID for username {}: {}", username, parentId);
            if (parentId == null) {
                logger.error("No parentId found for username: {}", username);
                return ResponseEntity.status(404).body(null);
            }

            List<Patient> patients = patientRepository.findByParentId(parentId);
            if (patients.isEmpty()) {
                logger.warn("No patients found for parentId: {}", parentId);
                return ResponseEntity.noContent().build();
            }
            logger.debug("Found {} patients for parentId: {}", patients.size(), parentId);

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
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PatientDTO> addPatient(@RequestBody PatientDTO patientDTO) {
        logger.debug("Processing /api/parents/patients POST request with patientDTO: {}", patientDTO);
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.error("No authenticated user found");
                return ResponseEntity.status(401).body(null);
            }

            String username = authentication.getName();
            logger.debug("Authenticated username: {}", username);

            PatientDTO savedPatientDTO = patientService.addPatient(patientDTO, username);
            logger.debug("Patient added successfully with id: {}", savedPatientDTO.getId());
            return ResponseEntity.status(201).body(savedPatientDTO);
        } catch (Exception e) {
            logger.error("Error adding patient: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }
>>>>>>> ngocle_new
}
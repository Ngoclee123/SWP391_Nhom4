package com.example.project.controler.vacin;

import com.example.project.dto.PatientDTO;
import com.example.project.model.Patient;
import com.example.project.repository.PatientRepository;
import com.example.project.service.ParentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/parents")
public class PatientController {

    private static final Logger logger = LoggerFactory.getLogger(PatientController.class);

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ParentService parentService;

    @GetMapping("/patients")
    public CompletableFuture<ResponseEntity<List<PatientDTO>>> getPatientsByParent() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Integer parentId = null;
                var authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.User) {
                    String username = authentication.getName();
                    parentId = parentService.getParentIdByUsername(username);
                }

                List<Patient> patients;
                if (parentId != null) {
                    patients = patientRepository.findByParentId(parentId);
                } else {
                    patients = patientRepository.findAll();
                    logger.warn("No authenticated user found, returning all patients");
                }

                List<PatientDTO> patientDTOs = patients.stream()
                        .map(PatientDTO::new)
                        .collect(Collectors.toList());
                return ResponseEntity.ok(patientDTOs);

            } catch (Exception e) {
                logger.error("Error fetching patients: {}", e.getMessage());
                return ResponseEntity.status(500).build();
            }
        });
    }
}
package com.example.project.controler.vacin;

import com.example.project.dto.PatientDTO;
import com.example.project.model.Patient;
import com.example.project.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminPatientController {
    @Autowired
    private PatientRepository patientRepository;

    @GetMapping("/patients")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();
        List<PatientDTO> dtos = patients.stream().map(PatientDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}

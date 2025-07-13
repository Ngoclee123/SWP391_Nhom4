package com.example.project.controler;

import com.example.project.dto.PatientDTO;
import com.example.project.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class PatientController {

    @Autowired
    private PatientService patientService;

    // Removed duplicate updatePatient endpoint - now handled by vacin.PatientController
    // ...other endpoints...
}
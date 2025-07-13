package com.example.project.service;

import com.example.project.dto.PatientDTO;
import com.example.project.model.Parent;
import com.example.project.model.Patient;
import com.example.project.repository.ParentRepository;
import com.example.project.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private static final Logger logger = LoggerFactory.getLogger(PatientService.class);

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ParentRepository parentRepository;

    public Integer getParentIdByAccountId(Integer accountId) {
        logger.debug("Fetching parentId for accountId: {}", accountId);
        Parent parent = parentRepository.findByAccountId(accountId);
        Integer parentId = (parent != null) ? parent.getId() : null;
        logger.debug("ParentId for accountId {}: {}", accountId, parentId);
        return parentId;
    }

    public PatientDTO addPatient(PatientDTO patientDTO, Integer accountId) {
        try {
            logger.debug("Adding patient with data: {}", patientDTO);
            Integer parentId = getParentIdByAccountId(accountId);
            if (parentId == null) {
                logger.error("No parentId found for accountId: {}", accountId);
                throw new IllegalArgumentException("Parent not found for accountId: " + accountId);
            }

            Parent parent = parentRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent not found with id: " + parentId));

            Patient patient = new Patient();
            patient.setFullName(patientDTO.getFullName());
            try {
                patient.setDateOfBirth(LocalDate.parse(patientDTO.getDateOfBirth())); // Parse từ String
            } catch (DateTimeParseException e) {
                logger.error("Invalid dateOfBirth format: {}. Expected YYYY-MM-DD", patientDTO.getDateOfBirth(), e);
                throw new IllegalArgumentException("Invalid dateOfBirth format: " + patientDTO.getDateOfBirth() + ". Use YYYY-MM-DD.");
            }
            patient.setGender(patientDTO.getGender());
            patient.setWeight(patientDTO.getWeight() != null ? BigDecimal.valueOf(patientDTO.getWeight()) : null);
            patient.setHeight(patientDTO.getHeight() != null ? BigDecimal.valueOf(patientDTO.getHeight()) : null);
            patient.setParent(parent);

            Patient savedPatient = patientRepository.save(patient);
            logger.debug("Successfully added patient with id: {}", savedPatient.getId());
            return new PatientDTO(savedPatient);
        } catch (Exception e) {
            logger.error("Error adding patient: {}", e.getMessage(), e);
            throw e;
        }
    }

    public List<PatientDTO> getPatientsByParentId(Integer parentId) {
        logger.debug("Fetching patients for parentId: {}", parentId);
        List<Patient> patients = patientRepository.findByParentId(parentId);
        List<PatientDTO> patientDTOs = patients.stream()
                .map(patient -> {
                    PatientDTO dto = new PatientDTO(patient);
                    dto.setId(patient.getId());
                    dto.setFullName(patient.getFullName());
                    return dto;
                })
                .collect(Collectors.toList());
        logger.debug("Found {} patients for parentId: {}", patientDTOs.size(), parentId);
        return patientDTOs;
    }
}
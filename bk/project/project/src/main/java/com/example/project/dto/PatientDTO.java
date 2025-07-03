package com.example.project.dto;

import com.example.project.model.Patient;
import lombok.Data;

@Data
public class PatientDTO {
    private Integer id;
    private String fullName;
    private String dateOfBirth;
    private String gender;
    private Double weight;
    private Double height;
    private String medicalConditions;
    private String createdAt;

    public PatientDTO(Patient patient) {
        this.id = patient.getId();
        this.fullName = patient.getFullName();
        this.dateOfBirth = patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null;
        this.gender = patient.getGender();
        this.weight = patient.getWeight() != null ? patient.getWeight().doubleValue() : null;
        this.height = patient.getHeight() != null ? patient.getHeight().doubleValue() : null;
        this.medicalConditions = patient.getMedicalConditions();
        this.createdAt = patient.getCreatedAt() != null ? patient.getCreatedAt().toString() : null;
    }
}
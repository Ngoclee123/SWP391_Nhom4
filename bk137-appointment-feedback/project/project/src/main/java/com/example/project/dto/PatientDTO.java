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
    private String createdAt;
    private String status;

    // Default constructor
    public PatientDTO() {
        this.status = "Chờ xác nhận";
    }

    public PatientDTO(Patient patient) {
        this.id = patient.getId();
        this.fullName = patient.getFullName();
        this.dateOfBirth = patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null;
        this.gender = patient.getGender();
        this.weight = patient.getWeight() != null ? patient.getWeight().doubleValue() : null;
        this.height = patient.getHeight() != null ? patient.getHeight().doubleValue() : null;
        this.createdAt = patient.getCreatedAt() != null ? patient.getCreatedAt().toString() : null;
        this.status = patient.getStatus() != null ? patient.getStatus() : "Chờ xác nhận";
        
        // Debug logging
        System.out.println("Created PatientDTO: " + this);
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "PatientDTO{" +
                "id=" + id +
                ", fullName='" + fullName + '\'' +
                ", dateOfBirth='" + dateOfBirth + '\'' +
                ", gender='" + gender + '\'' +
                ", weight=" + weight +
                ", height=" + height +
                ", status='" + status + '\'' +
                '}';
    }
}
<<<<<<< HEAD
package com.example.project.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PatientDTO {
    private Integer id;

    @NotNull
    @Size(max = 100)
    @JsonProperty("fullName")
    private String fullName;

    @NotNull
    @JsonProperty("dateOfBirth") // Nhận String từ frontend
    private String dateOfBirth;

    @Size(max = 10)
    @JsonProperty("gender")
    private String gender;

    @JsonProperty("weight")
    private Double weight;

    @JsonProperty("height")
    private Double height;

    @JsonProperty("accountId")
    private Integer accountId;

    private String status;
    private String createdAt;
    // Default constructor
    public PatientDTO() {
        this.status = "Chờ xác nhận";
    }



    // Constructor từ Patient
    public PatientDTO(com.example.project.model.Patient patient) {
        this.id = patient.getId();
        this.fullName = patient.getFullName();
        this.dateOfBirth = patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null; // Chuyển LocalDate sang String
        this.gender = patient.getGender();
        this.weight = patient.getWeight() != null ? patient.getWeight().doubleValue() : null;
        this.height = patient.getHeight() != null ? patient.getHeight().doubleValue() : null;
        this.createdAt = patient.getCreatedAt() != null ? patient.getCreatedAt().toString() : null;
        this.status = patient.getStatus() != null ? patient.getStatus() : "Chờ xác nhận";
    }

    // Constructor đầy đủ
    public PatientDTO(String fullName, String dateOfBirth, String gender, Double weight, Double height, Integer accountId) {
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.weight = weight;
        this.height = height;
        this.accountId = accountId;
    }

    // Getter và Setter
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public Integer getAccountId() {
        return accountId;
    }

    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
    }
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
=======
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

    public PatientDTO(Patient patient) {
        this.id = patient.getId();
        this.fullName = patient.getFullName();
        this.dateOfBirth = patient.getDateOfBirth().toString();
        this.gender = patient.getGender();
        this.weight = patient.getWeight() != null ? patient.getWeight().doubleValue() : null;
        this.height = patient.getHeight() != null ? patient.getHeight().doubleValue() : null;
    }
>>>>>>> ngocle_new
}
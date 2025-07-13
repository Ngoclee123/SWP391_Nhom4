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

    // Constructor mặc định
    public PatientDTO() {
    }

    // Constructor từ Patient
    public PatientDTO(com.example.project.model.Patient patient) {
        this.id = patient.getId();
        this.fullName = patient.getFullName();
        this.dateOfBirth = patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null; // Chuyển LocalDate sang String
        this.gender = patient.getGender();
        this.weight = patient.getWeight() != null ? patient.getWeight().doubleValue() : null;
        this.height = patient.getHeight() != null ? patient.getHeight().doubleValue() : null;
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
}
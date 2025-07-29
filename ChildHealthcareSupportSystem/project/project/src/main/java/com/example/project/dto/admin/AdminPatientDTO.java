package com.example.project.dto.admin;

import java.time.LocalDate;
import java.math.BigDecimal;

public class AdminPatientDTO {
    public Integer id;
    public String fullName;
    public LocalDate dateOfBirth;
    public String gender;
    public BigDecimal weight;
    public BigDecimal height;
    public String status;

    public AdminPatientDTO(Integer id, String fullName, LocalDate dateOfBirth, String gender, BigDecimal weight, BigDecimal height, String status) {
        this.id = id;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.weight = weight;
        this.height = height;
        this.status = status;
    }
}
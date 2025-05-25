package com.example.project.dto;

import lombok.Data;

@Data
public class DoctorSearchDTO {
    private Integer specialtyId;
    private String fullName;
    private String availabilityStatus;

}

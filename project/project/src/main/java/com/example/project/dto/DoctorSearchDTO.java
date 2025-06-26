package com.example.project.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DoctorSearchDTO {

    private Integer id;
    private String fullName;
    private String bio;
    private String phoneNumber;
    private String imgs;
    private String locational;
    private String specialtyName;
    private List<String> certificates;
    private String email;
    private String address;
    private String education;
    private String hospital;
    // Các trường mới cho giờ làm việc cố định
    private String morningHours;
    private String afternoonHours;
    private List<AvailabilityDTO> availabilities;

    // Getters và setters được tự động tạo bởi Lombok
}
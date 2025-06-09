package com.example.project.dto;

import java.time.LocalDate;

public class ParentProfileDTO {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private LocalDate dateOfBirth;
    // Constructors
    public ParentProfileDTO() {}
    public ParentProfileDTO(String fullName, String email, String phoneNumber, String address,LocalDate dateOfBirth) {
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
    }

    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
}
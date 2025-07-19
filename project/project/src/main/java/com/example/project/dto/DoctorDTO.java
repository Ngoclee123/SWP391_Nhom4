package com.example.project.dto;

import java.util.List;
import java.time.Instant;
import java.time.LocalDate;

public class DoctorDTO {
    private Integer id;
    private String fullName;
    private Integer specialtyId;
    private String imgs;
    private String bio;
    private LocalDate dateOfBirth;
    private String locational;
    private String hospital;
    private String phoneNumber;
    private String status;
    private String education;
    private List<String> certificates;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Integer getSpecialtyId() { return specialtyId; }
    public void setSpecialtyId(Integer specialtyId) { this.specialtyId = specialtyId; }

    public String getImgs() { return imgs; }
    public void setImgs(String imgs) { this.imgs = imgs; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getLocational() { return locational; }
    public void setLocational(String locational) { this.locational = locational; }

    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public List<String> getCertificates() { return certificates; }
    public void setCertificates(List<String> certificates) { this.certificates = certificates; }
}
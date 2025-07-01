package com.example.project.dto;

import java.util.List;

public class DoctorSearchDTO {

    private Integer id;
    private String fullName;
    private String bio;
    private String phoneNumber;
    private String imgs;
    private String locational;
    private Integer specialtyId;
    private String specialtyName;
    private String availabilityStatus; // Từ DoctorAvailability.status
    private String startTime; // Từ DoctorAvailability.start_time
    private String endTime;   // Từ DoctorAvailability.end_time
    private List<String> certificates;

    // Getters và setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getImgs() { return imgs; }
    public void setImgs(String imgs) { this.imgs = imgs; }

    public String getLocational() { return locational; }
    public void setLocational(String locational) { this.locational = locational; }

    public Integer getSpecialtyId() { return specialtyId; }
    public void setSpecialtyId(Integer specialtyId) { this.specialtyId = specialtyId; }

    public String getSpecialtyName() { return specialtyName; }
    public void setSpecialtyName(String specialtyName) { this.specialtyName = specialtyName; }

    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public List<String> getCertificates() { return certificates; }
    public void setCertificates(List<String> certificates) { this.certificates = certificates; }
}
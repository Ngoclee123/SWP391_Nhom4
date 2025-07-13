package com.example.project.dto;


import java.time.LocalDateTime;

public class DoctorAvailabilityDTO {
    private Integer id; // availability_id
    private Integer doctorId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private LocalDateTime createdAt;

    // Constructors
    public DoctorAvailabilityDTO() {}

    public DoctorAvailabilityDTO(com.example.project.model.DoctorAvailability da) {
        this.id = da.getId(); // availability_id
        this.doctorId = da.getDoctor() != null ? da.getDoctor().getId() : null;
        this.startTime = da.getStartTime();
        this.endTime = da.getEndTime();
        this.status = da.getStatus();
        this.createdAt = da.getCreatedAt();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
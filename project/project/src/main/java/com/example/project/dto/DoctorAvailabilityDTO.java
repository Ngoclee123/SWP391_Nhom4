package com.example.project.dto;

import java.time.Instant;

public class DoctorAvailabilityDTO {
    private Integer id;
    private Integer doctorId;
    private Instant startTime;
    private Instant endTime;
    private String status;
    private Instant createdAt;

    // Constructors
    public DoctorAvailabilityDTO() {}

    public DoctorAvailabilityDTO(Integer id, Integer doctorId, Instant startTime, Instant endTime, String status, Instant createdAt) {
        this.id = id;
        this.doctorId = doctorId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
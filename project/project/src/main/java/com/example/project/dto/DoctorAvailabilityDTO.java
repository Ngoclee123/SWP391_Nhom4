package com.example.project.dto;

import java.time.Instant;

public class DoctorAvailabilityDTO {
    private Integer availabilityId;
    private Instant startTime;
    private Instant endTime;
    private String status;

    // Getters và Setters
    public Integer getAvailabilityId() { return availabilityId; }
    public void setAvailabilityId(Integer availabilityId) { this.availabilityId = availabilityId; }

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
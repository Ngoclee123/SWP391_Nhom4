package com.example.project.dto;

import java.time.LocalDateTime;

public class DoctorAvailabilitySlotRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int slotMinutes;

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public int getSlotMinutes() { return slotMinutes; }
    public void setSlotMinutes(int slotMinutes) { this.slotMinutes = slotMinutes; }
} 
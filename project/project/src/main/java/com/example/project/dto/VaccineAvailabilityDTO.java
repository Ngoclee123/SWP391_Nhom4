package com.example.project.dto;

import java.time.Instant;
import java.time.LocalDateTime;

public class VaccineAvailabilityDTO {
    private Integer id;
    private LocalDateTime availableDate;
    private String location;
    private Integer capacity;
    private Integer vaccineId;
    private String vaccineName;

    public VaccineAvailabilityDTO() {}

    public VaccineAvailabilityDTO(Integer id, LocalDateTime availableDate, String location, Integer capacity, Integer vaccineId, String vaccineName) {
        this.id = id;
        this.availableDate = availableDate;
        this.location = location;
        this.capacity = capacity;
        this.vaccineId = vaccineId;
        this.vaccineName = vaccineName;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public LocalDateTime getAvailableDate() { return availableDate; }
    public void setAvailableDate(LocalDateTime availableDate) { this.availableDate = availableDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Integer getVaccineId() { return vaccineId; }
    public void setVaccineId(Integer vaccineId) { this.vaccineId = vaccineId; }
    public String getVaccineName() { return vaccineName; }
    public void setVaccineName(String vaccineName) { this.vaccineName = vaccineName; }
} 
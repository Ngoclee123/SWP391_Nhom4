package com.example.project.dto;

import java.time.Instant;

public class VaccineAvailabilityDTO {
    private Integer id;
    private Instant availableDate;
    private String location;
    private Integer capacity;
    private Integer vaccineId;
    private String vaccineName;

    public VaccineAvailabilityDTO() {}

    public VaccineAvailabilityDTO(Integer id, Instant availableDate, String location, Integer capacity, Integer vaccineId, String vaccineName) {
        this.id = id;
        this.availableDate = availableDate;
        this.location = location;
        this.capacity = capacity;
        this.vaccineId = vaccineId;
        this.vaccineName = vaccineName;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Instant getAvailableDate() { return availableDate; }
    public void setAvailableDate(Instant availableDate) { this.availableDate = availableDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Integer getVaccineId() { return vaccineId; }
    public void setVaccineId(Integer vaccineId) { this.vaccineId = vaccineId; }
    public String getVaccineName() { return vaccineName; }
    public void setVaccineName(String vaccineName) { this.vaccineName = vaccineName; }
} 
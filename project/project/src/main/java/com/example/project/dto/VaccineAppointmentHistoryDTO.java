package com.example.project.dto;

public class VaccineAppointmentHistoryDTO {
    private Integer id;
    private String vaccineName;
    private String appointmentDate;
    private String location;
    private String status;
    private String vaccineImage; // hoặc imageUrl, image, ...
    private Integer vaccineId;
    // Getters and setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getVaccineName() { return vaccineName; }
    public void setVaccineName(String vaccineName) { this.vaccineName = vaccineName; }
    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getVaccineImage() {
        return vaccineImage;
    }

    public void setVaccineImage(String vaccineImage) {
        this.vaccineImage = vaccineImage;
    }

    public Integer getVaccineId() {
        return vaccineId;
    }

    public void setVaccineId(Integer vaccineId) {
        this.vaccineId = vaccineId;
    }
}
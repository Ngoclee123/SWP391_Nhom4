package com.example.project.dto;

public class VaccineAppointmentDTO {
    private Integer id;
    private String patientName;
    private String vaccineName;
    private String appointmentDate;
    private String location;
    private String status;
    private Integer patientId;
    private Integer vaccineId;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getVaccineName() { return vaccineName; }
    public void setVaccineName(String vaccineName) { this.vaccineName = vaccineName; }
    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }
    public Integer getVaccineId() { return vaccineId; }
    public void setVaccineId(Integer vaccineId) { this.vaccineId = vaccineId; }
} 
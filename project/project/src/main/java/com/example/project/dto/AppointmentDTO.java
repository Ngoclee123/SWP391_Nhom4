package com.example.project.dto;

import java.time.LocalDateTime;

public class AppointmentDTO {
    private Integer id;
    private Integer patientId;
    private Integer doctorId;
    private Integer specialtyId;
    private Integer serviceId;
    private LocalDateTime appointmentDate;
    private Integer duration;
    private String priority;
    private String consultationType;
    private String status;
    private String notes;
    private LocalDateTime createdAt;

    public AppointmentDTO() {}

    public AppointmentDTO(Integer id, Integer patientId, Integer doctorId, Integer specialtyId, Integer serviceId, LocalDateTime appointmentDate, Integer duration, String priority, String consultationType, String status, String notes, LocalDateTime createdAt) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.specialtyId = specialtyId;
        this.serviceId = serviceId;
        this.appointmentDate = appointmentDate;
        this.duration = duration;
        this.priority = priority;
        this.consultationType = consultationType;
        this.status = status;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }
    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }
    public Integer getSpecialtyId() { return specialtyId; }
    public void setSpecialtyId(Integer specialtyId) { this.specialtyId = specialtyId; }
    public Integer getServiceId() { return serviceId; }
    public void setServiceId(Integer serviceId) { this.serviceId = serviceId; }
    public LocalDateTime getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDateTime appointmentDate) { this.appointmentDate = appointmentDate; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getConsultationType() { return consultationType; }
    public void setConsultationType(String consultationType) { this.consultationType = consultationType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
} 
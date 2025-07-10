package com.example.project.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
<<<<<<< Updated upstream
    private Integer id;

    @Column(name = "patient_id", nullable = false)
    private Integer patientId;

    @Column(name = "doctor_id", nullable = false)
    private Integer doctorId;

    @Column(name = "specialty_id", nullable = false)
=======
    private Integer appointmentId;

    @Column(name = "patient_id")
    private Integer patientId;

    @Column(name = "doctor_id")
    private Integer doctorId;

    @Column(name = "specialty_id")
>>>>>>> Stashed changes
    private Integer specialtyId;

    @Column(name = "service_id")
    private Integer serviceId;
<<<<<<< Updated upstream

    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;

    @Column(name = "duration", nullable = false)
    private Integer duration;

    @Column(name = "priority")
    private String priority;

    @Column(name = "consultation_type")
    private String consultationType;

    @Column(name = "status")
    private String status;

    @Column(name = "notes")
=======

    @Column(name = "appointment_date")
    private LocalDateTime appointmentDate;

    private Integer duration;
    private String priority;

    @Column(name = "consultation_type")
    private String consultationType;

    private String status;
>>>>>>> Stashed changes
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

<<<<<<< Updated upstream
    // ===== GETTER & SETTER =====

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
=======
    public Integer getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Integer appointmentId) {
        this.appointmentId = appointmentId;
>>>>>>> Stashed changes
    }

    public Integer getPatientId() {
        return patientId;
    }

    public void setPatientId(Integer patientId) {
        this.patientId = patientId;
    }

    public Integer getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Integer doctorId) {
        this.doctorId = doctorId;
    }
<<<<<<< Updated upstream

    public Integer getSpecialtyId() {
        return specialtyId;
    }

    public void setSpecialtyId(Integer specialtyId) {
        this.specialtyId = specialtyId;
    }

    public Integer getServiceId() {
        return serviceId;
    }

    public void setServiceId(Integer serviceId) {
        this.serviceId = serviceId;
    }

    public LocalDateTime getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDateTime appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getConsultationType() {
        return consultationType;
    }

=======
    public Integer getSpecialtyId() {
        return specialtyId;
    }
    public void setSpecialtyId(Integer specialtyId) {
        this.specialtyId = specialtyId;
    }
    public Integer getServiceId() {
        return serviceId;
    }
    public void setServiceId(Integer serviceId) {
        this.serviceId = serviceId;
    }
    public LocalDateTime getAppointmentDate() {
        return appointmentDate;
    }
    public void setAppointmentDate(LocalDateTime appointmentDate) {
        this.appointmentDate = appointmentDate;
    }
    public Integer getDuration() {
        return duration;
    }
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    public String getPriority() {
        return priority;
    }
    public void setPriority(String priority) {
        this.priority = priority;
    }
    public String getConsultationType() {
        return consultationType;
    }
>>>>>>> Stashed changes
    public void setConsultationType(String consultationType) {
        this.consultationType = consultationType;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
<<<<<<< Updated upstream

    public String getNotes() {
        return notes;
    }

=======
    public String getNotes() {
        return notes;
    }
>>>>>>> Stashed changes
    public void setNotes(String notes) {
        this.notes = notes;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}
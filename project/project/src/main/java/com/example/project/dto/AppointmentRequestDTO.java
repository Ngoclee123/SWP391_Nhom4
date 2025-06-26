package com.example.project.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequestDTO {

    private Integer patientId;
    private Integer doctorId;
    private Integer specialtyId;
    // serviceId có thể không bắt buộc, tùy logic của bạn
    private Integer serviceId; 
    private LocalDateTime appointmentDate;
    private Integer duration;
    private String notes;
    private String status;
    private String priority;
    private String consultationType;
    private String timeSlot;
    private String symptoms;
    private String paymentMethod;
    private String bankCode;

    // Getters and setters
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

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getConsultationType() { return consultationType; }
    public void setConsultationType(String consultationType) { this.consultationType = consultationType; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getBankCode() { return bankCode; }
    public void setBankCode(String bankCode) { this.bankCode = bankCode; }
}

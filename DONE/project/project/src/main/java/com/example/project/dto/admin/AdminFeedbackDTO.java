package com.example.project.dto.admin;

import java.time.LocalDateTime;

public class AdminFeedbackDTO {
    private Integer feedbackId;
    private String parentName;
    private String doctorName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private Integer appointmentId;
    private Boolean isRead;

    // Getters and setters
    public Integer getFeedbackId() { return feedbackId; }
    public void setFeedbackId(Integer feedbackId) { this.feedbackId = feedbackId; }
    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Integer getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Integer appointmentId) { this.appointmentId = appointmentId; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
} 
package com.example.project.dto;

import java.time.LocalDateTime;

import com.example.project.model.Feedback;

public class FeedbackDTO {
    private Integer feedbackId;
    private Integer parentId;
    private String parentName; // Tên phụ huynh
    private Integer doctorId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private Integer appointmentId;

    public FeedbackDTO() {}

    public FeedbackDTO(Integer parentId, Integer doctorId, Integer rating, String comment, LocalDateTime createdAt, Integer appointmentId) {
        this.parentId = parentId;
        this.doctorId = doctorId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.appointmentId = appointmentId;
    }

    public Integer getFeedbackId() {
        return feedbackId;
    }

    public void setFeedbackId(Integer feedbackId) {
        this.feedbackId = feedbackId;
    }

    public Integer getParentId() {
        return parentId;
    }

    public void setParentId(Integer parentId) {
        this.parentId = parentId;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public Integer getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Integer doctorId) {
        this.doctorId = doctorId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Integer appointmentId) {
        this.appointmentId = appointmentId;
    }

    @Override
    public String toString() {
        return "FeedbackDTO{" +
                "feedbackId=" + feedbackId +
                ", parentId=" + parentId +
                ", parentName='" + parentName + '\'' +
                ", doctorId=" + doctorId +
                ", rating=" + rating +
                ", comment='" + comment + '\'' +
                ", createdAt=" + createdAt +
                ", appointmentId=" + appointmentId +
                '}';
    }

    public static FeedbackDTO fromEntity(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setFeedbackId(feedback.getId());
        dto.setParentId(feedback.getParent() != null ? feedback.getParent().getParentId() : null);
        dto.setParentName(feedback.getParent() != null ? feedback.getParent().getFullName() : null);
        dto.setDoctorId(feedback.getDoctor() != null ? feedback.getDoctor().getId() : null);
        dto.setAppointmentId(feedback.getAppointment() != null ? feedback.getAppointment().getAppointmentId() : null);
        dto.setRating(feedback.getRating());
        dto.setComment(feedback.getComment());
        dto.setCreatedAt(feedback.getCreatedAt());
        return dto;
    }
}

package com.example.project.dto;

import java.util.List;

public class DoctorDashboardDTO {
    private String fullName;
    private String specialtyName;
    private List<AvailabilityDTO> availabilities;
    private List<AppointmentDTO> upcomingAppointments;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getSpecialtyName() { return specialtyName; }
    public void setSpecialtyName(String specialtyName) { this.specialtyName = specialtyName; }
    public List<AvailabilityDTO> getAvailabilities() { return availabilities; }
    public void setAvailabilities(List<AvailabilityDTO> availabilities) { this.availabilities = availabilities; }
    public List<AppointmentDTO> getUpcomingAppointments() { return upcomingAppointments; }
    public void setUpcomingAppointments(List<AppointmentDTO> upcomingAppointments) { this.upcomingAppointments = upcomingAppointments; }

    public static class AvailabilityDTO {
        private Integer id;
        private String startTime;
        private String endTime;
        private String status;

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class AppointmentDTO {
        private Integer id;
        private String patientName;
        private String appointmentTime;
        private String status;

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getPatientName() { return patientName; }
        public void setPatientName(String patientName) { this.patientName = patientName; }
        public String getAppointmentTime() { return appointmentTime; }
        public void setAppointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
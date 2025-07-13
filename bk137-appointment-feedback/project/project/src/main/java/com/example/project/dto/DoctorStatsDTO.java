package com.example.project.dto;

public class DoctorStatsDTO {
    private Integer doctorId;
    private String doctorName;
    private String specialtyName;
    private Long appointmentCount;
    private Long vaccinationCount;
    private Long totalExaminations;

    // Constructors
    public DoctorStatsDTO() {}

    public DoctorStatsDTO(Integer doctorId, String doctorName, String specialtyName, 
                         Long appointmentCount, Long vaccinationCount) {
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.specialtyName = specialtyName;
        this.appointmentCount = appointmentCount != null ? appointmentCount : 0;
        this.vaccinationCount = vaccinationCount != null ? vaccinationCount : 0;
        this.totalExaminations = this.appointmentCount + this.vaccinationCount;
    }

    // Getters and Setters
    public Integer getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Integer doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getSpecialtyName() {
        return specialtyName;
    }

    public void setSpecialtyName(String specialtyName) {
        this.specialtyName = specialtyName;
    }

    public Long getAppointmentCount() {
        return appointmentCount;
    }

    public void setAppointmentCount(Long appointmentCount) {
        this.appointmentCount = appointmentCount;
        updateTotalExaminations();
    }

    public Long getVaccinationCount() {
        return vaccinationCount;
    }

    public void setVaccinationCount(Long vaccinationCount) {
        this.vaccinationCount = vaccinationCount;
        updateTotalExaminations();
    }

    public Long getTotalExaminations() {
        return totalExaminations;
    }

    public void setTotalExaminations(Long totalExaminations) {
        this.totalExaminations = totalExaminations;
    }

    private void updateTotalExaminations() {
        this.totalExaminations = (this.appointmentCount != null ? this.appointmentCount : 0) + 
                                (this.vaccinationCount != null ? this.vaccinationCount : 0);
    }
}

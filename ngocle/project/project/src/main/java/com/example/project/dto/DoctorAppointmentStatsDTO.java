package com.example.project.dto;

public class DoctorAppointmentStatsDTO {
    private int confirmedToday;
    private int confirmedThisWeek;
    private int confirmedThisMonth;

    public DoctorAppointmentStatsDTO() {}

    public DoctorAppointmentStatsDTO(int confirmedToday, int confirmedThisWeek, int confirmedThisMonth) {
        this.confirmedToday = confirmedToday;
        this.confirmedThisWeek = confirmedThisWeek;
        this.confirmedThisMonth = confirmedThisMonth;
    }

    // Getters and setters...

    public int getConfirmedToday() {
        return confirmedToday;
    }

    public void setConfirmedToday(int confirmedToday) {
        this.confirmedToday = confirmedToday;
    }

    public int getConfirmedThisWeek() {
        return confirmedThisWeek;
    }

    public void setConfirmedThisWeek(int confirmedThisWeek) {
        this.confirmedThisWeek = confirmedThisWeek;
    }

    public int getConfirmedThisMonth() {
        return confirmedThisMonth;
    }

    public void setConfirmedThisMonth(int confirmedThisMonth) {
        this.confirmedThisMonth = confirmedThisMonth;
    }
}
package com.example.project.dto;

public class AccountStatsDTO {
    private String role;
    private long count;

    public AccountStatsDTO() {
    }

    public AccountStatsDTO(String role, long count) {
        this.role = role;
        this.count = count;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
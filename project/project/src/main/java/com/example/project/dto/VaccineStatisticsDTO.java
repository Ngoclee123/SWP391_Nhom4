package com.example.project.dto;
import java.util.Map;

public class VaccineStatisticsDTO {
    private double totalRevenue;
    private Map<String, Integer> vaccineTypeCount;
    private Map<String, Integer> vaccineCategoryCount;

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
    public Map<String, Integer> getVaccineTypeCount() { return vaccineTypeCount; }
    public void setVaccineTypeCount(Map<String, Integer> vaccineTypeCount) { this.vaccineTypeCount = vaccineTypeCount; }
    public Map<String, Integer> getVaccineCategoryCount() { return vaccineCategoryCount; }
    public void setVaccineCategoryCount(Map<String, Integer> vaccineCategoryCount) { this.vaccineCategoryCount = vaccineCategoryCount; }
} 
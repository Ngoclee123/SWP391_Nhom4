<<<<<<< HEAD
package com.example.project.controler.vacin;

public class VaccineAppointmentRequest {
    private Integer patientId; // Optional, will be overridden by parent’s patient
    private Integer vaccineId;
    private String appointmentDate; // ISO format (e.g., "2025-06-12T10:00:00Z")
    private Integer doseNumber;
    private String location;
    private String notes;
    private String paymentMethod; // For payment
    private String bankCode; // For VNPay

    // Getters and setters
    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public Integer getVaccineId() { return vaccineId; }
    public void setVaccineId(Integer vaccineId) { this.vaccineId = vaccineId; }

    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }

    public Integer getDoseNumber() { return doseNumber; }
    public void setDoseNumber(Integer doseNumber) { this.doseNumber = doseNumber; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getBankCode() { return bankCode; }
    public void setBankCode(String bankCode) { this.bankCode = bankCode; }
}
=======
package com.example.project.controler.vacin;

public class VaccineAppointmentRequest {
    private Integer patientId; // Optional, will be overridden by parent’s patient
    private Integer vaccineId;
    private String appointmentDate; // ISO format (e.g., "2025-06-12T10:00:00Z")
    private Integer doseNumber;
    private String location;
    private String notes;
    private String paymentMethod; // For payment
    private String bankCode; // For VNPay

    // Getters and setters
    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public Integer getVaccineId() { return vaccineId; }
    public void setVaccineId(Integer vaccineId) { this.vaccineId = vaccineId; }

    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }

    public Integer getDoseNumber() { return doseNumber; }
    public void setDoseNumber(Integer doseNumber) { this.doseNumber = doseNumber; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getBankCode() { return bankCode; }
    public void setBankCode(String bankCode) { this.bankCode = bankCode; }
}
>>>>>>> ngocle_new

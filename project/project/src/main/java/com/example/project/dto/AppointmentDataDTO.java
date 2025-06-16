package com.example.project.dto;

import com.example.project.model.Patient;
import com.example.project.model.Vaccine;

public class AppointmentDataDTO {
    private Patient patient;
    private Vaccine vaccine;

    public AppointmentDataDTO(Patient patient, Vaccine vaccine) {
        this.patient = patient;
        this.vaccine = vaccine;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Vaccine getVaccine() {
        return vaccine;
    }

    public void setVaccine(Vaccine vaccine) {
        this.vaccine = vaccine;
    }
}
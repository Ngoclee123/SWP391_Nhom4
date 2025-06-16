package com.example.project.service;

import com.example.project.controler.vacin.VaccineAppointmentRequest;
import com.example.project.model.*;
import com.example.project.repository.VaccineAppointmentRepository;
import com.example.project.repository.PatientRepository;
import com.example.project.repository.VaccineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class VaccineAppointmentService {

    @Autowired
    private VaccineAppointmentRepository vaccineAppointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private VaccineRepository vaccineRepository;

    @Async
    public CompletableFuture<VaccineAppointment> createVaccineAppointment(VaccineAppointmentRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            VaccineAppointment appointment = new VaccineAppointment();

            Optional<Patient> patient = patientRepository.findById(request.getPatientId());
            if (!patient.isPresent()) {
                throw new RuntimeException("Patient not found");
            }
            Integer parentId = getCurrentParentId();
            if (!patient.get().getParent().getId().equals(parentId)) {
                throw new RuntimeException("Unauthorized: Patient does not belong to this parent");
            }
            appointment.setPatient(patient.get());

            Optional<Vaccine> vaccine = vaccineRepository.findById(request.getVaccineId());
            if (!vaccine.isPresent()) {
                throw new RuntimeException("Vaccine not found");
            }
            appointment.setVaccine(vaccine.get());

            appointment.setAppointmentDate(Instant.parse(request.getAppointmentDate()));
            appointment.setDoseNumber(request.getDoseNumber());
            appointment.setLocation(request.getLocation());
            appointment.setNotes(request.getNotes());
            appointment.setStatus("Pending");
            appointment.setCreatedAt(Instant.now());

            return vaccineAppointmentRepository.save(appointment);
        });
    }

    @Async
    public CompletableFuture<List<VaccineAppointment>> getAppointmentsByPatient(Integer patientId) {
        return CompletableFuture.supplyAsync(() -> {
            Integer parentId = getCurrentParentId();
            Optional<Patient> patient = patientRepository.findById(patientId);
            if (!patient.isPresent() || !patient.get().getParent().getId().equals(parentId)) {
                throw new RuntimeException("Unauthorized: Patient does not belong to this parent");
            }
            return vaccineAppointmentRepository.findByPatientId(patientId);
        });
    }

    @Async
    public CompletableFuture<VaccineAppointment> cancelVaccineAppointment(Integer id) {
        return CompletableFuture.supplyAsync(() -> {
            Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentRepository.findById(id);
            if (!appointmentOpt.isPresent()) {
                throw new RuntimeException("Vaccine appointment not found");
            }
            VaccineAppointment appointment = appointmentOpt.get();
            Integer parentId = getCurrentParentId();
            if (!appointment.getPatient().getParent().getId().equals(parentId)) {
                throw new RuntimeException("Unauthorized: Cannot cancel this appointment");
            }
            appointment.setStatus("Cancelled");
            return vaccineAppointmentRepository.save(appointment);
        });
    }

    @Async
    public CompletableFuture<VaccineAppointment> confirmVaccineAppointment(Integer id) {
        return CompletableFuture.supplyAsync(() -> {
            Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentRepository.findById(id);
            if (!appointmentOpt.isPresent()) {
                throw new RuntimeException("Vaccine appointment not found");
            }
            VaccineAppointment appointment = appointmentOpt.get();
            appointment.setStatus("Confirmed");
            return vaccineAppointmentRepository.save(appointment);
        });
    }

    @Async
    public CompletableFuture<List<VaccineAppointment>> getAllVaccineAppointments() {
        return CompletableFuture.supplyAsync(() -> vaccineAppointmentRepository.findAll());
    }

    private Integer getCurrentParentId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return Integer.parseInt(username);
    }

    public Integer getParentIdByUsername(String username) {
        // Implement logic to fetch parentId from username (e.g., via ParentService)
        throw new UnsupportedOperationException("Implement parent ID retrieval");
    }
}
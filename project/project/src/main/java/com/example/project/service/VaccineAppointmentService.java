package com.example.project.service;

import com.example.project.controler.vacin.VaccineAppointmentRequest;
import com.example.project.model.*;
import com.example.project.repository.VaccineAppointmentRepository;
import com.example.project.repository.PatientRepository;
import com.example.project.repository.VaccineRepository;

import com.example.project.repository.PaymentRepository;
import com.example.project.repository.RefundRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import java.math.BigDecimal;

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


    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RefundRepository refundRepository;


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

            appointment.setDoseNumber(request.getDoseNumber() != null ? request.getDoseNumber() : 1);

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


    @Async
    public CompletableFuture<Payment> getPaymentByVaccineAppointmentId(Integer vaccineAppointmentId) {
        return CompletableFuture.supplyAsync(() -> {
            Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentRepository.findById(vaccineAppointmentId);
            if (!appointmentOpt.isPresent()) {
                throw new RuntimeException("Vaccine appointment not found");
            }
            return paymentRepository.findByVaccineAppointmentId(vaccineAppointmentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
        });
    }

    @Async
    public CompletableFuture<Payment> createPayment(Integer vaccineAppointmentId, String paymentMethod) {
        return CompletableFuture.supplyAsync(() -> {
            Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentRepository.findById(vaccineAppointmentId);
            if (!appointmentOpt.isPresent()) {
                throw new RuntimeException("Vaccine appointment not found");
            }
            VaccineAppointment appointment = appointmentOpt.get();
            Payment payment = new Payment();
            payment.setPatient(appointment.getPatient());
            payment.setVaccineAppointment(appointment);
            payment.setAmount(new BigDecimal(calculateTotalFee(appointment)));
            payment.setPaymentMethod(paymentMethod);
            payment.setStatus("Pending");
            payment.setPaymentDate(Instant.now());
            return paymentRepository.save(payment);
        });
    }

    @Async
    public CompletableFuture<Void> requestRefund(Integer vaccineAppointmentId) {
        return CompletableFuture.supplyAsync(() -> {
            Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentRepository.findById(vaccineAppointmentId);
            if (!appointmentOpt.isPresent()) {
                throw new RuntimeException("Vaccine appointment not found");
            }
            Payment payment = paymentRepository.findByVaccineAppointmentId(vaccineAppointmentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
            if (!"Completed".equals(payment.getStatus())) {
                throw new RuntimeException("Cannot request refund for non-completed payment");
            }
            Refund refund = new Refund();
            refund.setPayment(payment);
            refund.setAmount(payment.getAmount());
            refund.setReason("Yêu cầu hoàn tiền từ khách hàng");
            refund.setStatus("Pending");
            refundRepository.save(refund);
            return null;
        });
    }

    @Async
    public CompletableFuture<Void> updateAppointmentStatus(Integer vaccineAppointmentId, String status) {
        return CompletableFuture.supplyAsync(() -> {
            Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentRepository.findById(vaccineAppointmentId);
            if (!appointmentOpt.isPresent()) {
                throw new RuntimeException("Vaccine appointment not found");
            }
            VaccineAppointment appointment = appointmentOpt.get();
            appointment.setStatus(status);
            vaccineAppointmentRepository.save(appointment);
            return null;
        });
    }

    @Async
    public CompletableFuture<Optional<VaccineAppointment>> getAppointmentById(Integer vaccineAppointmentId) {
        return CompletableFuture.supplyAsync(() -> vaccineAppointmentRepository.findById(vaccineAppointmentId));
    }


    private Integer getCurrentParentId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return Integer.parseInt(username);
    }


    private double calculateTotalFee(VaccineAppointment appointment) {
        // Logic to calculate total fee (e.g., based on vaccine cost)
        return 100000.0; // Placeholder, replace with actual logic


    }
}
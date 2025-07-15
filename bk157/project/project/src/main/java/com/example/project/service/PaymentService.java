package com.example.project.service;

import com.example.project.model.Payment;
import com.example.project.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public Optional<Payment> getPaymentByVaccineAppointmentId(Integer vaccineAppointmentId) {
        return paymentRepository.findByVaccineAppointmentId(vaccineAppointmentId);
    }
}

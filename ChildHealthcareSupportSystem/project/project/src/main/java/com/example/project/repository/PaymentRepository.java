package com.example.project.repository;

import com.example.project.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByVaccineAppointmentId(Integer vaccineAppointmentId);
    Optional<Payment> findByVaccineAppointmentIdAndPaymentMethod(Integer vaccineAppointmentId, String paymentMethod);
    void deleteByVaccineAppointmentId(Integer vaccineAppointmentId);
}
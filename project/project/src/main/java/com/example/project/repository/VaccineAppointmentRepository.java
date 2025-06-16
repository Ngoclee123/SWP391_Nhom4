package com.example.project.repository;

import com.example.project.model.VaccineAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface VaccineAppointmentRepository extends JpaRepository<VaccineAppointment, Integer> {
    List<VaccineAppointment> findByPatientId(Integer patientId);
    List<VaccineAppointment> findByVaccineIdAndStatus(Integer vaccineId, String status);
    List<VaccineAppointment> findByVaccineIdAndAppointmentDate(Integer vaccineId, Instant appointmentDate);

}
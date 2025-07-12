package com.example.project.repository;

import com.example.project.model.Appointment;
import com.example.project.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByDoctorIdAndAppointmentDateBetween(Integer doctorId, LocalDateTime start, LocalDateTime end);
    List<Appointment> findByPatient(Patient patient);
    boolean existsByAppointmentIdAndPatient_Parent_IdAndDoctor_IdAndStatus(Integer appointmentId, Integer parentId, Integer doctorId, String status);
}

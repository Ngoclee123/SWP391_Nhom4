package com.example.project.repository;

import com.example.project.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByDoctorId(Integer doctor_id);
}
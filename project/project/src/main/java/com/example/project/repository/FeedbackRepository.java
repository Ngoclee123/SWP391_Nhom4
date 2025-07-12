package com.example.project.repository;

import com.example.project.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    List<Feedback> findByDoctor_Id(Integer doctorId);
    boolean existsByAppointment_AppointmentId(Integer appointmentId);
}
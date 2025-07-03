package com.example.project.repository;

import com.example.project.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    
    @Query("SELECT a.doctorId, COUNT(a) FROM Appointment a " +
           "WHERE a.appointmentDate BETWEEN :startDate AND :endDate " +
           "AND a.status IN ('confirmed', 'completed') " +
           "GROUP BY a.doctorId")
    List<Object[]> countAppointmentsByDoctorInMonth(@Param("startDate") LocalDate startDate, 
                                                   @Param("endDate") LocalDate endDate);
    
    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId " +
           "AND a.appointmentDate BETWEEN :startDate AND :endDate " +
           "AND a.status IN ('confirmed', 'completed')")
    List<Appointment> findByDoctorIdAndDateRange(@Param("doctorId") Integer doctorId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);
}

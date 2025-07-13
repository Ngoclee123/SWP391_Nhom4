package com.example.project.repository;

import com.example.project.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    
    // Tìm appointments theo patient ID
    List<Appointment> findByPatientId(int patientId);
    
    // Tìm appointments theo doctor ID
    List<Appointment> findByDoctorId(int doctorId);
    
    // Tìm appointments theo status
    List<Appointment> findByStatus(String status);
    
    // Tìm appointments theo ngày
    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);
    
    // Đếm appointments theo status
    long countByStatus(String status);
    
    // Thống kê theo ngày
    @Query("SELECT CAST(a.appointmentDate AS DATE) as date, COUNT(*) FROM Appointment a " +
           "WHERE a.appointmentDate IS NOT NULL GROUP BY CAST(a.appointmentDate AS DATE)")
    List<Object[]> countGroupByDate();
    
    // Thống kê theo bác sĩ
    @Query("SELECT a.doctorId, COUNT(*) FROM Appointment a GROUP BY a.doctorId")
    List<Object[]> countGroupByDoctor();
    
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

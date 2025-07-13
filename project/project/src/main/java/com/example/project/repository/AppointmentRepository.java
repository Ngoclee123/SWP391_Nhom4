package com.example.project.repository;

import com.example.project.model.Appointment;
import com.example.project.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    
//    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId AND a.appointmentTime BETWEEN :startTime AND :endTime")
//    List<Appointment> findByDoctorIdAndAppointmentTimeBetween(
//        @Param("doctorId") int doctorId,
//        @Param("startTime") LocalDateTime startTime,
//        @Param("endTime") LocalDateTime endTime
//    );
//
//    @Query("SELECT a FROM Appointment a WHERE a.patientId = :patientId ORDER BY a.appointmentTime DESC")
//    List<Appointment> findByPatientIdOrderByAppointmentTimeDesc(@Param("patientId") int patientId);
//
//    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId ORDER BY a.appointmentTime DESC")
//    List<Appointment> findByDoctorIdOrderByAppointmentTimeDesc(@Param("doctorId") int doctorId);
//
//    @Query("SELECT a FROM Appointment a WHERE a.status = :status ORDER BY a.appointmentTime DESC")
//    List<Appointment> findByStatusOrderByAppointmentTimeDesc(@Param("status") String status);
//
//    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId AND a.appointmentTime = :appointmentTime")
//    long countByDoctorIdAndAppointmentTime(@Param("doctorId") int doctorId, @Param("appointmentTime") LocalDateTime appointmentTime);


    List<Appointment> findByDoctorIdAndAppointmentDateBetween(Integer doctorId, LocalDateTime start, LocalDateTime end);
    List<Appointment> findByPatient(Patient patient);
    boolean existsByAppointmentIdAndPatient_Parent_IdAndDoctor_IdAndStatus(Integer appointmentId, Integer parentId, Integer doctorId, String status);
// Lấy tất cả lịch hẹn của một bác sĩ
List<Appointment> findByDoctorId(Integer doctorId);

    // Lấy lịch hẹn của bác sĩ theo trạng thái
    List<Appointment> findByDoctorIdAndStatus(Integer doctorId, String status);

    // Lấy lịch hẹn sắp tới (ví dụ: sau thời điểm hiện tại)
    List<Appointment> findByDoctorIdAndAppointmentTimeAfter(Integer doctorId, java.time.LocalDateTime date);

    // Lấy lịch hẹn đã hoàn thành, sắp xếp theo thời gian hẹn giảm dần
    List<Appointment> findByDoctorIdAndStatusOrderByAppointmentTimeDesc(Integer doctorId, String status);

    @Modifying
    @Transactional
    @Query("UPDATE Appointment a SET a.status = :status WHERE a.appointmentId = :id")
    void updateStatusById(@Param("id") int id, @Param("status") String status);
}

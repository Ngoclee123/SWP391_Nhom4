package com.example.project.repository;

import com.example.project.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< Updated upstream
import java.util.List;


public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByDoctorId(Integer doctor_id);
=======
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    // Lấy tất cả lịch hẹn của một bác sĩ
    List<Appointment> findByDoctorId(Integer doctorId);

    // Lấy lịch hẹn của bác sĩ theo trạng thái
    List<Appointment> findByDoctorIdAndStatus(Integer doctorId, String status);

    // Lấy lịch hẹn sắp tới (ví dụ: sau thời điểm hiện tại)
    List<Appointment> findByDoctorIdAndAppointmentDateAfter(Integer doctorId, java.time.LocalDateTime date);

    // Lấy lịch hẹn đã hoàn thành
    List<Appointment> findByDoctorIdAndStatusOrderByAppointmentDateDesc(Integer doctorId, String status);
>>>>>>> Stashed changes
}
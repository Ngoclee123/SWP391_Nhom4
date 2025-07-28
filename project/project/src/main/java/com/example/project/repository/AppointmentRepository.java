package com.example.project.repository;

import com.example.project.model.Appointment;
import com.example.project.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
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

//    @Modifying
//    @Transactional
//    @Query("UPDATE Appointment a SET a.status = :status WHERE a.appointmentId = :id")
//    void updateStatusById(@Param("id") int id, @Param("status") String status);
//
//
//
//    // Tìm appointments theo patient ID
//    List<Appointment> findByPatientId(int patientId);
//
//    // Tìm appointments theo doctor ID
//    List<Appointment> findByDoctorId(int doctorId);
//
//    // Tìm appointments theo status
//    List<Appointment> findByStatus(String status);
//
//    // Tìm appointments theo ngày
//    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);
//
//    // Đếm appointments theo status
//    long countByStatus(String status);
//
//    // Đếm appointments theo ngày
//    long countByAppointmentDate(java.time.LocalDate appointmentDate);
//
//    // Đếm appointments theo khoảng ngày
//    long countByAppointmentDateBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
//
//    // Thống kê theo ngày
//    @Query("SELECT CAST(a.appointmentDate AS DATE) as date, COUNT(*) FROM Appointment a " +
//            "WHERE a.appointmentDate IS NOT NULL GROUP BY CAST(a.appointmentDate AS DATE)")
//    List<Object[]> countGroupByDate();
//
//    // Thống kê theo bác sĩ
//    @Query("SELECT a.doctor.id, a.doctor.fullName, COUNT(*) FROM Appointment a GROUP BY a.doctor.id, a.doctor.fullName")
//    List<Object[]> countGroupByDoctor();
//
//    @Query("SELECT a.doctor.id, COUNT(a) FROM Appointment a " +
//           "WHERE a.appointmentDate BETWEEN :startDate AND :endDate " +
//           "GROUP BY a.doctor.id")
//    List<Object[]> countAppointmentsByDoctorInMonth(@Param("startDate") java.time.LocalDateTime startDate,
//                                                    @Param("endDate") java.time.LocalDateTime endDate);
//
//    // Thống kê theo tháng
//    @org.springframework.data.jpa.repository.Query("SELECT FUNCTION('MONTH', a.appointmentDate) as month, COUNT(*) FROM Appointment a WHERE a.appointmentDate IS NOT NULL GROUP BY FUNCTION('MONTH', a.appointmentDate)")
//    java.util.List<Object[]> countGroupByMonth();
//
//    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctorId " +
//            "AND a.appointmentDate BETWEEN :startDate AND :endDate " +
//            "AND a.status IN ('confirmed', 'completed')")
//    List<Appointment> findByDoctorIdAndDateRange(@Param("doctorId") Integer doctorId,
//                                                 @Param("startDate") LocalDate startDate,
//                                                 @Param("endDate") LocalDate endDate);
//
//    @Query("SELECT a FROM Appointment a ORDER BY a.createdAt DESC")
//    List<Appointment> findRecentAppointments(org.springframework.data.domain.Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE Appointment a SET a.status = :status WHERE a.appointmentId = :id")
    void updateStatusById(@Param("id") int id, @Param("status") String status);



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

    // Đếm appointments theo ngày
    long countByAppointmentDate(java.time.LocalDate appointmentDate);

    // Đếm appointments theo khoảng ngày
    long countByAppointmentDateBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    // Thống kê theo ngày
    @Query("SELECT CAST(a.appointmentDate AS DATE) as date, COUNT(*) FROM Appointment a " +
            "WHERE a.appointmentDate IS NOT NULL GROUP BY CAST(a.appointmentDate AS DATE)")
    List<Object[]> countGroupByDate();

    // Thống kê theo bác sĩ
    @Query("SELECT a.doctor.id, a.doctor.fullName, COUNT(*) FROM Appointment a GROUP BY a.doctor.id, a.doctor.fullName")
    List<Object[]> countGroupByDoctor();

    @Query("SELECT a.doctor.id, COUNT(a) FROM Appointment a " +
            "WHERE a.appointmentDate BETWEEN :startDate AND :endDate " +
            "GROUP BY a.doctor.id")
    List<Object[]> countAppointmentsByDoctorInMonth(@Param("startDate") java.time.LocalDateTime startDate,
                                                    @Param("endDate") java.time.LocalDateTime endDate);

    // Thống kê theo tháng
    @org.springframework.data.jpa.repository.Query("SELECT FUNCTION('MONTH', a.appointmentDate) as month, COUNT(*) FROM Appointment a WHERE a.appointmentDate IS NOT NULL GROUP BY FUNCTION('MONTH', a.appointmentDate)")
    java.util.List<Object[]> countGroupByMonth();

    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctorId " +
            "AND a.appointmentDate BETWEEN :startDate AND :endDate " +
            "AND a.status IN ('confirmed', 'completed')")
    List<Appointment> findByDoctorIdAndDateRange(@Param("doctorId") Integer doctorId,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Appointment a ORDER BY a.createdAt DESC")
    List<Appointment> findRecentAppointments(org.springframework.data.domain.Pageable pageable);

    // Nếu trường ngày là appointmentDate (LocalDate)
    int countByDoctorIdAndAppointmentDate(Long doctorId, LocalDateTime dateTime);
    int countByDoctorIdAndAppointmentDateBetween(Long doctorId, LocalDateTime start, LocalDateTime end);

    // Đếm lịch hẹn đã xác nhận theo khoảng thời gian
    int countByDoctorIdAndStatusAndAppointmentTimeBetween(Integer doctorId, String status, OffsetDateTime start, OffsetDateTime end);

}

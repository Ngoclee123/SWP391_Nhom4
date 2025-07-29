package com.example.project.repository;

import com.example.project.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    List<Feedback> findByDoctorId(Integer id);

    @Query(value = "SELECT feedback_id, parent_id, doctor_id, appointment_id, rating, comment, created_at FROM Feedback", nativeQuery = true)
    List<Object[]> findAllFeedbackForAdminRaw();

    @Query(value = "SELECT f.feedback_id, p.full_name as parent_name, d.full_name as doctor_name, f.rating, f.comment, f.created_at, f.is_read FROM Feedback f LEFT JOIN Parents p ON f.parent_id = p.parent_id LEFT JOIN Doctors d ON f.doctor_id = d.doctor_id", nativeQuery = true)
    List<Object[]> findAllFeedbackWithNamesForAdmin();

    @Query(value = "SELECT f.feedback_id, p.full_name as parent_name, d.full_name as doctor_name, f.rating, f.comment, f.created_at, f.is_read FROM Feedback f LEFT JOIN Parents p ON f.parent_id = p.parent_id LEFT JOIN Doctors d ON f.doctor_id = d.doctor_id ORDER BY f.feedback_id DESC OFFSET ?1 ROWS FETCH NEXT ?2 ROWS ONLY", nativeQuery = true)
    List<Object[]> findFeedbackWithNamesForAdminPaging(int offset, int pageSize);

    @Modifying
    @Query(value = "UPDATE Feedback SET is_read = 1 WHERE feedback_id = ?1", nativeQuery = true)
    void markAsReadById(Integer id);
=======
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    List<Feedback> findByDoctor_Id(Integer doctorId);
    boolean existsByAppointment_AppointmentId(Integer appointmentId);
>>>>>>> ngocle_new
}
package com.example.project.repository;

import com.example.project.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer>, JpaSpecificationExecutor<Doctor> {
    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities")
    List<Doctor> findAllWithAvailabilities();

    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities WHERE d.id = :id")
    Optional<Doctor> findByIdWithAvailabilities(@Param("id") Integer id);

    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities da WHERE d.id = :id " +
            "AND (:searchTime IS NULL OR (da.startTime <= :searchTime AND da.endTime >= :searchTime))")
    Optional<Doctor> findByIdWithAvailabilities(@Param("id") Integer id, @Param("searchTime") Instant searchTime);

    Optional<Doctor> findByAccountId(Integer accountId);

    @Query("SELECT d FROM Doctor d WHERE LOWER(d.status) = 'online'")
    List<Doctor> findOnlineDoctors();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(d) FROM Doctor d WHERE LOWER(d.status) = LOWER(:status)")
    long countByStatus(@org.springframework.data.repository.query.Param("status") String status);
}
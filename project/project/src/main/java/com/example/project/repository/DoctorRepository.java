package com.example.project.repository;

import com.example.project.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Integer>, JpaSpecificationExecutor<Doctor> {
    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities") // Use Doctor (entity name)
    List<Doctor> findAllWithAvailabilities();

    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.availabilities WHERE d.id = :id")
    Optional<Doctor> findByIdWithAvailabilities(@Param("id") Integer id);

    Optional<Doctor> findByAccountId(Integer accountId);
}
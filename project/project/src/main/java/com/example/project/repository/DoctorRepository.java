package com.example.project.repository;

import com.example.project.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer>, JpaSpecificationExecutor<Doctor> {
    
    @Query("SELECT DISTINCT d FROM Doctor d " +
           "LEFT JOIN FETCH d.account a " +
           "LEFT JOIN FETCH d.specialty s " +
           "LEFT JOIN FETCH d.certificates c " +
           "LEFT JOIN FETCH d.availabilities av " +
           "WHERE d.id = :id " +
           "ORDER BY av.startTime DESC")
    Optional<Doctor> findByIdWithDetails(@Param("id") Integer id);

    @Query("SELECT DISTINCT d FROM Doctor d " +
           "LEFT JOIN FETCH d.account a " +
           "LEFT JOIN FETCH d.specialty s " +
           "LEFT JOIN FETCH d.certificates c " +
           "LEFT JOIN FETCH d.availabilities av " +
           "ORDER BY d.id")
    List<Doctor> findAllWithDetails();

    Optional<Doctor> findByAccountId(Integer accountId);
}
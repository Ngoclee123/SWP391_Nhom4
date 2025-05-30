package com.example.project.repository;


import com.example.project.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    @Query("SELECT d FROM Doctor d WHERE (:specialtyId IS NULL OR d.specialty = :specialtyId) " +
            "AND (:fullName IS NULL OR d.fullName LIKE %:fullName%) " +
            "AND (:availabilityStatus IS NULL OR EXISTS (" +
            "    SELECT 1 FROM DoctorAvailability da WHERE da.id = d.id AND da.status = :availabilityStatus))"
    )
    List<Doctor> searchDoctors(@Param("specialtyId") Integer specialtyId,
                               @Param("fullName") String fullName,
                               @Param("availabilityStatus") String availabilityStatus);
}

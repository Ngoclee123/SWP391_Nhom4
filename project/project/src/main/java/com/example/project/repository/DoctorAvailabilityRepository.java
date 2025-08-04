package com.example.project.repository;

import com.example.project.model.DoctorAvailability;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Integer> {

    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId")
    List<DoctorAvailability> findByDoctorId(@Param("doctorId") Integer doctorId);

    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId")
    Page<DoctorAvailability> findByDoctorId(@Param("doctorId") Integer doctorId, Pageable pageable);

    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId AND da.status = :status")
    List<DoctorAvailability> findByDoctorIdAndStatus(@Param("doctorId") Integer doctorId, @Param("status") String status);

    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId AND UPPER(da.status) = UPPER(:status)")
    List<DoctorAvailability> findByDoctorIdAndStatusIgnoreCase(@Param("doctorId") Integer doctorId, @Param("status") String status);

    @Query(value = "SELECT * FROM DoctorAvailability WHERE doctor_id = ?1 AND UPPER(status) = UPPER(?2)", nativeQuery = true)
    List<DoctorAvailability> findByDoctorIdAndStatusNative(Integer doctorId, String status);
}
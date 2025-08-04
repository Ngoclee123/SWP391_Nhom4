package com.example.project.repository;

import com.example.project.model.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {
    List<MedicalRecord> findByPatientId(Integer patientId);
    
    List<MedicalRecord> findByDoctorId(Integer doctorId);
    
    @Query("SELECT m FROM MedicalRecord m WHERE m.doctorId = :doctorId")
    Page<MedicalRecord> findByDoctorId(@Param("doctorId") Integer doctorId, Pageable pageable);
}
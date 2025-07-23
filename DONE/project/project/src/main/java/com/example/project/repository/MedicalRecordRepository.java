package com.example.project.repository;

import com.example.project.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {
    List<MedicalRecord> findByPatientId(Integer patientId);
    List<MedicalRecord> findByDoctorId(Integer doctorId);
    List<MedicalRecord> findByAppointmentId(Integer appointmentId);
}
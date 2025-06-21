package com.example.project.repository;

import com.example.project.model.VaccineAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface VaccineAppointmentRepository extends JpaRepository<VaccineAppointment, Integer> {

    // Tìm tất cả lịch hẹn theo ID bệnh nhân
    List<VaccineAppointment> findByPatientId(Integer patientId);

    // Tìm tất cả lịch hẹn theo vaccineId và trạng thái
    List<VaccineAppointment> findByVaccineIdAndStatus(Integer vaccineId, String status);

    // Tìm lịch hẹn theo vaccineId và ngày hẹn
    List<VaccineAppointment> findByVaccineIdAndAppointmentDate(Integer vaccineId, Instant appointmentDate);
}

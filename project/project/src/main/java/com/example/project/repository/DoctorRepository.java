package com.example.project.repository;

import com.example.project.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {

    @Query(value = "SELECT DISTINCT d.* FROM Doctors d " +
            "LEFT JOIN Specialties s ON d.specialty_id = s.specialty_id " +
            "LEFT JOIN DoctorAvailability da ON d.doctor_id = da.doctor_id " +
            "WHERE (:specialtyId IS NULL OR s.specialty_id = :specialtyId) " +
            "AND (:fullName IS NULL OR dbo.RemoveDiacritics(d.full_name) LIKE '%' + dbo.RemoveDiacritics(:fullName) + '%') " +
            "AND (:location IS NULL OR dbo.RemoveDiacritics(d.locational) LIKE '%' + dbo.RemoveDiacritics(:location) + '%') " +
            "AND (:availabilityStatus IS NULL OR da.status = :availabilityStatus) " +
            "AND (:availabilityTime IS NULL OR (da.start_time <= :availabilityTime AND da.end_time >= :availabilityTime))",
            nativeQuery = true)
    List<Doctor> searchDoctors(@Param("specialtyId") Integer specialtyId,
                               @Param("fullName") String fullName,
                               @Param("availabilityStatus") String availabilityStatus,
                               @Param("location") String location,
                               @Param("availabilityTime") Instant availabilityTime);

    Optional<Doctor> findByAccountId(Integer accountId);
}
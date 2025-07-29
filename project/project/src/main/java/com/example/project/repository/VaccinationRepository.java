package com.example.project.repository;

import com.example.project.model.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Integer> {

    @Query("SELECT v.doctor.id, COUNT(v) FROM Vaccination v " +
            "WHERE v.vaccinationDate BETWEEN :startDate AND :endDate " +
            "GROUP BY v.doctor.id")
    List<Object[]> countVaccinationsByDoctorInMonth(@Param("startDate") Instant startDate,
                                                    @Param("endDate") Instant endDate);

    @Query("SELECT v FROM Vaccination v WHERE v.doctor.id = :doctorId " +
            "AND v.vaccinationDate BETWEEN :startDate AND :endDate")
    List<Vaccination> findByDoctorIdAndDateRange(@Param("doctorId") Integer doctorId,
                                                 @Param("startDate") Instant startDate,
                                                 @Param("endDate") Instant endDate);
}
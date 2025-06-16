package com.example.project.repository;

import com.example.project.model.VaccineAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface VaccineAvailabilityRepository extends JpaRepository<VaccineAvailability, Integer> {
    List<VaccineAvailability> findByVaccineId(Integer vaccineId);
    VaccineAvailability findByVaccineIdAndAvailableDateAndLocation(Integer vaccineId, Instant availableDate, String location);
}
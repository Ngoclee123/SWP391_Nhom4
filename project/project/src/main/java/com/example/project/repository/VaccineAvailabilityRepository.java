package com.example.project.repository;

import com.example.project.model.VaccineAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;


import java.time.LocalDateTime;
import java.util.List;

public interface VaccineAvailabilityRepository extends JpaRepository<VaccineAvailability, Integer> {

    @Query("SELECT va FROM VaccineAvailability va WHERE va.vaccine.id = :vaccineId AND va.capacity > 0")
    List<VaccineAvailability> findByVaccine_vaccin_id(Integer vaccineId);

    @Query("SELECT va FROM VaccineAvailability va WHERE va.vaccine.id = :vaccineId AND va.availableDate = :availableDate AND va.location = :location")
    VaccineAvailability findByVaccine_vaccin_idAndAvailableDateAndLocation(Integer vaccineId, LocalDateTime availableDate, String location);


}
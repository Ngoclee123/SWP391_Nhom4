package com.example.project.service;

import com.example.project.dto.DoctorSearchDTO;
import com.example.project.model.Doctor;
import com.example.project.model.Specialty;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.DoctorSpecification;
import com.example.project.repository.SpecialtyRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    public List<Specialty> getAllSpecialties() {
        return specialtyRepository.findAll();
    }
    public List<DoctorSearchDTO> searchDoctors(Integer specialtyId, String fullName, String availabilityStatus, String location, String availabilityTime) {
        final Integer localSpecialtyId = specialtyId;
        final String localFullName = fullName;
        final String localAvailabilityStatus = availabilityStatus;
        final String localLocation = location;

        final Instant finalSearchTime = (availabilityTime != null && !availabilityTime.isEmpty())
                ? Instant.parse(availabilityTime.replace(" ", "T") + "+07:00") // Ensure +07:00 timezone
                : null;

        List<Doctor> doctors = doctorRepository.findAll(
                DoctorSpecification.searchDoctors(localSpecialtyId, localFullName, localAvailabilityStatus, localLocation, finalSearchTime)
        );

        return doctors.stream().map(doctor -> {
            DoctorSearchDTO dto = new DoctorSearchDTO();
            dto.setId(doctor.getId());
            dto.setFullName(doctor.getFullName());
            dto.setBio(doctor.getBio());
            dto.setPhoneNumber(doctor.getPhoneNumber());
            dto.setImgs(doctor.getImgs());
            dto.setLocational(doctor.getLocational());
            dto.setSpecialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null);
            dto.setSpecialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null);

            if (doctor.getAvailabilities() != null && !doctor.getAvailabilities().isEmpty()) {
                final String finalAvailabilityStatus = localAvailabilityStatus;
                doctor.getAvailabilities().stream()
                        .filter(da -> finalAvailabilityStatus == null || da.getStatus().equals(finalAvailabilityStatus))
                        .filter(da -> finalSearchTime == null ||
                                (da.getStartTime().isBefore(finalSearchTime) || da.getStartTime().equals(finalSearchTime)) &&
                                        (da.getEndTime().isAfter(finalSearchTime) || da.getEndTime().equals(finalSearchTime)))
                        .findFirst()
                        .ifPresent(da -> {
                            dto.setAvailabilityStatus(da.getStatus());
                            dto.setStartTime(da.getStartTime().toString());
                            dto.setEndTime(da.getEndTime().toString());
                        });
            }

            return dto;
        }).collect(Collectors.toList());
    }

    public DoctorSearchDTO getDoctorById(Integer doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

        DoctorSearchDTO dto = new DoctorSearchDTO();
        dto.setId(doctor.getId());
        dto.setFullName(doctor.getFullName());
        dto.setBio(doctor.getBio());
        dto.setPhoneNumber(doctor.getPhoneNumber());
        dto.setImgs(doctor.getImgs());
        dto.setLocational(doctor.getLocational());
        dto.setSpecialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null);
        dto.setSpecialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null);

        // Lấy thông tin từ DoctorAvailability
        if (doctor.getAvailabilities() != null && !doctor.getAvailabilities().isEmpty()) {
            doctor.getAvailabilities().stream()
                    .findFirst()
                    .ifPresent(da -> {
                        dto.setAvailabilityStatus(da.getStatus());
                        dto.setStartTime(da.getStartTime().toString());
                        dto.setEndTime(da.getEndTime().toString());
                    });
        }

        return dto;
    }

    public Doctor findDoctorByAccountId(Integer accountId) {
        return doctorRepository.findByAccountId(accountId).orElse(null);
    }



    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void printAllDoctorsOnStartup() {
        System.out.println("=== Printing all doctors on application startup ===");
        List<Doctor> allDoctors = doctorRepository.findAllWithAvailabilities();
        allDoctors.forEach(doctor -> {
            System.out.println("Doctor ID: " + doctor.getId() +
                    ", Full Name: " + doctor.getFullName() +
                    ", Bytes: " + Arrays.toString(doctor.getFullName().getBytes(StandardCharsets.UTF_8)) +
                    ", Specialty ID: " + (doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : "null") +
                    ", Phone: " + doctor.getPhoneNumber() +
                    ", availabilities: " + doctor.getAvailabilities() +
                    ", Location: " + doctor.getLocational());
        });
    }
}
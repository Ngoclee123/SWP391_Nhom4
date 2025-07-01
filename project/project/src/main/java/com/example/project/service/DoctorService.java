package com.example.project.service;

import com.example.project.dto.DoctorSearchDTO;
import com.example.project.model.Doctor;
import com.example.project.model.Specialty;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.DoctorSpecification;
import com.example.project.repository.SpecialtyRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorService.class);

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    public List<Specialty> getAllSpecialties() {
        logger.info("Fetching all specialties");
        return specialtyRepository.findAll();
    }

    public Page<DoctorSearchDTO> searchDoctors(
            Integer specialtyId,
            String fullName,
            String availabilityStatus,
            String location,
            String availabilityTime,
            Pageable pageable) {
        logger.info("Searching doctors with criteria: specialtyId={}, fullName={}, availabilityStatus={}, location={}, availabilityTime={}",
                specialtyId, fullName, availabilityStatus, location, availabilityTime);

        Instant searchTime = null;
        if (availabilityTime != null && !availabilityTime.trim().isEmpty()) {
            try {
                // Parse the UTC ISO string sent from the frontend
                searchTime = Instant.parse(availabilityTime);
                logger.debug("Parsed availabilityTime: {}", searchTime);
            } catch (Exception e) {
                logger.error("Invalid availabilityTime format: {}", availabilityTime, e);
                throw new IllegalArgumentException("Invalid availabilityTime format");
            }
        }

        Page<Doctor> doctors = doctorRepository.findAll(
                DoctorSpecification.searchDoctors(specialtyId, fullName, availabilityStatus, location, searchTime),
                pageable
        );

        return doctors.map(doctor -> {
            DoctorSearchDTO dto = new DoctorSearchDTO();
            dto.setId(doctor.getId());
            dto.setFullName(doctor.getFullName());
            dto.setBio(doctor.getBio());
            dto.setPhoneNumber(doctor.getPhoneNumber());
            dto.setImgs(doctor.getImgs());
            dto.setLocational(doctor.getLocational());
            dto.setSpecialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null);
            dto.setSpecialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null);

            // Map the first available slot (filtered by query)
            doctor.getAvailabilities().stream().findFirst().ifPresent(da -> {
                dto.setAvailabilityStatus(da.getStatus());
                dto.setStartTime(da.getStartTime().toString());
                dto.setEndTime(da.getEndTime().toString());
            });

            // Map certificates
            dto.setCertificates(
                doctor.getCertificates() != null
                    ? doctor.getCertificates().stream().map(c -> c.getCertificateName()).collect(java.util.stream.Collectors.toList())
                    : new java.util.ArrayList<>()
            );

            return dto;
        });
    }

    public DoctorSearchDTO getDoctorById(Integer doctorId) {
        logger.info("Fetching doctor with ID: {}", doctorId);
        Doctor doctor = doctorRepository.findByIdWithAvailabilitiesAndCertificates(doctorId)
                .orElseThrow(() -> {
                    logger.error("Doctor not found with ID: {}", doctorId);
                    return new RuntimeException("Doctor not found with ID: " + doctorId);
                });

        DoctorSearchDTO dto = new DoctorSearchDTO();
        dto.setId(doctor.getId());
        dto.setFullName(doctor.getFullName());
        dto.setBio(doctor.getBio());
        dto.setPhoneNumber(doctor.getPhoneNumber());
        dto.setImgs(doctor.getImgs());
        dto.setLocational(doctor.getLocational());
        dto.setSpecialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null);
        dto.setSpecialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null);

        doctor.getAvailabilities().stream().findFirst().ifPresent(da -> {
            dto.setAvailabilityStatus(da.getStatus());
            dto.setStartTime(da.getStartTime().toString());
            dto.setEndTime(da.getEndTime().toString());
        });

        // Map certificates
        dto.setCertificates(
            doctor.getCertificates() != null
                ? doctor.getCertificates().stream().map(c -> c.getCertificateName()).collect(java.util.stream.Collectors.toList())
                : new java.util.ArrayList<>()
        );

        return dto;
    }
    // New method to fetch Doctor entity
    public Doctor getDoctorEntityById(Integer doctorId) {
        logger.info("Fetching doctor entity with ID: {}", doctorId);
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> {
                    logger.error("Doctor not found with ID: {}", doctorId);
                    return new RuntimeException("Doctor not found with ID: " + doctorId);
                });
    }

    public Doctor findDoctorByAccountId(Integer accountId) {
        logger.info("Fetching doctor by account ID: {}", accountId);
        return doctorRepository.findByAccountId(accountId).orElse(null);
    }
}



package com.example.project.service;

import com.example.project.dto.DoctorSearchDTO;
import com.example.project.model.Doctor;
import com.example.project.model.Specialty;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.SpecialtyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import java.time.ZoneId;

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
        Instant searchTime = null;
        if (availabilityTime != null && !availabilityTime.isEmpty()) {
            try {
                searchTime = Instant.parse(availabilityTime);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid availabilityTime format");
            }
        }

        final Instant finalSearchTime = searchTime; // Biến final để sử dụng trong lambda

        List<Doctor> doctors = doctorRepository.searchDoctors(specialtyId, fullName, availabilityStatus, location, finalSearchTime);
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

            // Lấy thông tin từ DoctorAvailability
            if (doctor.getAvailabilities() != null && !doctor.getAvailabilities().isEmpty()) {
                doctor.getAvailabilities().stream()
                        .filter(da -> {
                            // Chuyển LocalDateTime thành Instant
                            ZoneId zoneId = ZoneId.systemDefault();
                            Instant startInstant = da.getStartTime().atZone(zoneId).toInstant();
                            Instant endInstant = da.getEndTime().atZone(zoneId).toInstant();

                            boolean matchStatus = (availabilityStatus == null || da.getStatus().equals(availabilityStatus));
                            boolean matchTime = (finalSearchTime == null ||
                                    (!startInstant.isAfter(finalSearchTime) && !endInstant.isBefore(finalSearchTime))
                            );
                            return matchStatus && matchTime;
                        })
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
    public void printAllDoctorsOnStartup() {
        System.out.println("=== Printing all doctors on application startup ===");
        List<Doctor> allDoctors = doctorRepository.findAll();
        allDoctors.forEach(doctor -> {
            System.out.println("Doctor ID: " + doctor.getId() +
                    ", Full Name: " + doctor.getFullName() +
                    ", Specialty ID: " + (doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : "null") +
                    ", Phone: " + doctor.getPhoneNumber() +
                    ", Location: " + doctor.getLocational());
        });
    }
}
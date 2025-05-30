package com.example.project.service;

import com.example.project.dto.DoctorSearchDTO;
import com.example.project.model.Doctor;
import com.example.project.model.Specialty;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.SpecialtyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;



@Service
public abstract class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    public List<Specialty> getSpecialties() {
        return specialtyRepository.findAll();
    }

    public List<Doctor> searchDoctors(Integer specialtyId, String fullName, String availabilityStatus, String location, String availabilityTime) {
        List<Doctor> doctors = doctorRepository.findAll();

        if (specialtyId != null) {
            doctors = doctors.stream()
                    .filter(doctor -> doctor.getSpecialty() == specialtyId)
                    .collect(Collectors.toList());
        }

        if (fullName != null && !fullName.isEmpty()) {
            doctors = doctors.stream()
                    .filter(doctor -> doctor.getFullName().toLowerCase().contains(fullName.toLowerCase()))
                    .collect(Collectors.toList());
        }

        if (availabilityStatus != null && !availabilityStatus.isEmpty()) {
            doctors = doctors.stream()
                    .filter(doctor -> doctor.getAvailability().equalsIgnoreCase(availabilityStatus))
                    .collect(Collectors.toList());
        }

        if (location != null && !location.isEmpty()) {
            doctors = doctors.stream()
                    .filter(doctor -> doctor.getLocational() != null && doctor.getLocational().toLowerCase().contains(location.toLowerCase()))
                    .collect(Collectors.toList());
        }

        if (availabilityTime != null && !availabilityTime.isEmpty()) {
            LocalDateTime searchTime = LocalDateTime.parse(availabilityTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            doctors = doctors.stream()
                    .filter(doctor -> doctor.getAvailabilityTime() != null && doctor.getAvailabilityTime().isAfter(Instant.from(searchTime)))
                    .collect(Collectors.toList());
        }

        return doctors;
    }

    public abstract List<Doctor> searchDoctors(DoctorSearchDTO searchDTO);

    public abstract List<Specialty> getAllSpecialties();
}
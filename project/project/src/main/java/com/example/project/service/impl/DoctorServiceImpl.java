package com.example.project.service.impl;

import com.example.project.dto.DoctorSearchDTO;
import com.example.project.model.Doctor;
import com.example.project.model.Specialty;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.SpecialtyRepository;
import com.example.project.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorServiceImpl extends DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Override
    public List<Doctor> searchDoctors(DoctorSearchDTO searchDTO) {
        return doctorRepository.searchDoctors(
                searchDTO.getSpecialtyId(),
                searchDTO.getFullName(),
                searchDTO.getAvailabilityStatus()
        );
    }

    @Override
    public List<Specialty> getAllSpecialties() {
        return specialtyRepository.findAll();
    }
}

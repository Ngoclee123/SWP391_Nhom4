package com.example.project.service;
import com.example.project.dto.DoctorSearchDTO;
import com.example.project.model.Doctor;
import com.example.project.model.Specialty;

import java.util.List;

public interface DoctorService {
    List<Doctor> searchDoctors(DoctorSearchDTO searchDTO);
    List<Specialty> getAllSpecialties();
}

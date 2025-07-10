package com.example.project.service.impl;

import com.example.project.model.MedicalRecord;
import com.example.project.repository.MedicalRecordRepository;
import com.example.project.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordServiceImpl implements MedicalRecordService {

    @Autowired
    private MedicalRecordRepository repository;

    @Override
    public List<MedicalRecord> getAllRecords() {
        return repository.findAll();
    }

    @Override
    public MedicalRecord getRecordById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public MedicalRecord createRecord(MedicalRecord record) {
        return repository.save(record);
    }

    @Override
    public MedicalRecord updateRecord(Integer id, MedicalRecord record) {
        Optional<MedicalRecord> existing = repository.findById(id);
        if (existing.isPresent()) {
            record.setRecordId(id);
            return repository.save(record);
        }
        return null;
    }

    @Override
    public void deleteRecord(Integer id) {
        repository.deleteById(id);
    }

    @Override
    public List<MedicalRecord> getRecordsByPatientId(Integer patientId) {
        return repository.findByPatientId(patientId);
    }

    @Override
    public List<MedicalRecord> getRecordsByDoctorId(Integer doctorId) {
        return repository.findByDoctorId(doctorId);
    }
}
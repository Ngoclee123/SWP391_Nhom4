package com.example.project.service.impl;

import com.example.project.model.MedicalRecord;
import com.example.project.repository.MedicalRecordRepository;
import com.example.project.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicalRecordServiceImpl implements MedicalRecordService {
    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Override
    public List<MedicalRecord> getAllRecords() {
        // Xử lý logic nếu cần, ví dụ: sắp xếp, lọc, ...
        return medicalRecordRepository.findAll();
    }

    @Override
    public MedicalRecord getRecordById(Integer id) {
        // Xử lý logic nếu cần, ví dụ: kiểm tra quyền truy cập, ...
        return medicalRecordRepository.findById(id).orElse(null);
    }

    @Override
    public MedicalRecord createRecord(MedicalRecord record) {
        // Xử lý logic nếu cần, ví dụ: validate dữ liệu, ...
        return medicalRecordRepository.save(record);
    }

    @Override
    public MedicalRecord updateRecord(Integer id, MedicalRecord record) {
        // Xử lý logic nếu cần, ví dụ: kiểm tra tồn tại, validate, ...
        record.setRecordId(id);
        return medicalRecordRepository.save(record);
    }

    @Override
    public void deleteRecord(Integer id) {
        // Xử lý logic nếu cần, ví dụ: kiểm tra quyền, ...
        medicalRecordRepository.deleteById(id);
    }

    @Override
    public List<MedicalRecord> getRecordsByPatientId(Integer patientId) {
        // Xử lý logic nếu cần
        return medicalRecordRepository.findByPatientId(patientId);
    }

    @Override
    public List<MedicalRecord> getRecordsByDoctorId(Integer doctorId) {
        // Xử lý logic nếu cần
        return medicalRecordRepository.findByDoctorId(doctorId);
    }
} 
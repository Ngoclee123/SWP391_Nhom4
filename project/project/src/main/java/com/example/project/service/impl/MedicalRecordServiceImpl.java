package com.example.project.service.impl;

import com.example.project.model.MedicalRecord;
import com.example.project.repository.MedicalRecordRepository;
import com.example.project.service.MedicalRecordService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicalRecordServiceImpl implements MedicalRecordService {
    private static final Logger logger = LoggerFactory.getLogger(MedicalRecordServiceImpl.class);
    
    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Override
    public List<MedicalRecord> getAllRecords() {
        // Xử lý logic nếu cần, ví dụ: sắp xếp, lọc, ...
        return medicalRecordRepository.findAll();
    }

    @Override
    public Page<MedicalRecord> getAllRecordsPaginated(Pageable pageable) {
        return medicalRecordRepository.findAll(pageable);
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

    @Override
    public Page<MedicalRecord> getRecordsByDoctorIdPaginated(Integer doctorId, Pageable pageable) {
        try {
            logger.info("Fetching medical records for doctorId: {} with page: {}, size: {}", 
                       doctorId, pageable.getPageNumber(), pageable.getPageSize());
            
            Page<MedicalRecord> result = medicalRecordRepository.findByDoctorId(doctorId, pageable);
            
            logger.info("Found {} records for doctorId: {} (page {} of {})", 
                       result.getContent().size(), doctorId, 
                       result.getNumber() + 1, result.getTotalPages());
            
            return result;
        } catch (Exception e) {
            logger.error("Error fetching medical records for doctorId: {}", doctorId, e);
            throw e;
        }
    }
} 
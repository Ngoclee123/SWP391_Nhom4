package com.example.project.service;

import com.example.project.model.MedicalRecord;
import java.util.List;

public interface MedicalRecordService {
    List<MedicalRecord> getAllRecords();
    MedicalRecord getRecordById(Integer id);
    MedicalRecord createRecord(MedicalRecord record);
    MedicalRecord updateRecord(Integer id, MedicalRecord record);
    void deleteRecord(Integer id);

    List<MedicalRecord> getRecordsByPatientId(Integer patientId);
    List<MedicalRecord> getRecordsByDoctorId(Integer doctorId);
}
package com.example.project.controler;

import com.example.project.model.MedicalRecord;
import com.example.project.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "http://localhost:3000")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService service;

    @GetMapping
    public List<MedicalRecord> getAllRecords() {
        return service.getAllRecords();
    }

    @GetMapping("/{id}")
    public MedicalRecord getRecordById(@PathVariable Integer id) {
        return service.getRecordById(id);
    }

    @PostMapping
    public MedicalRecord createRecord(@RequestBody MedicalRecord record) {
        return service.createRecord(record);
    }

    @PutMapping("/{id}")
    public MedicalRecord updateRecord(@PathVariable Integer id, @RequestBody MedicalRecord record) {
        return service.updateRecord(id, record);
    }

    @DeleteMapping("/{id}")
    public void deleteRecord(@PathVariable Integer id) {
        service.deleteRecord(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<MedicalRecord> getRecordsByPatientId(@PathVariable Integer patientId) {
        return service.getRecordsByPatientId(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<MedicalRecord> getRecordsByDoctorId(@PathVariable Integer doctorId) {
        return service.getRecordsByDoctorId(doctorId);
    }
}
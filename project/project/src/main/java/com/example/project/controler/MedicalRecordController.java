package com.example.project.controler;

import com.example.project.model.MedicalRecord;
import com.example.project.service.MedicalRecordService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "http://localhost:3000")
public class MedicalRecordController {
    private static final Logger logger = LoggerFactory.getLogger(MedicalRecordController.class);

    @Autowired
    private MedicalRecordService service;

    @GetMapping
    public Page<MedicalRecord> getAllRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return service.getAllRecordsPaginated(pageable);
    }

    @GetMapping("/all")
    public List<MedicalRecord> getAllRecordsList() {
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
    public Page<MedicalRecord> getRecordsByDoctorId(
            @PathVariable Integer doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("API called: GET /api/medical-records/doctor/{} with page={}, size={}", doctorId, page, size);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<MedicalRecord> result = service.getRecordsByDoctorIdPaginated(doctorId, pageable);
            
            logger.info("API response: Found {} records for doctorId: {} (page {} of {})", 
                       result.getContent().size(), doctorId, 
                       result.getNumber() + 1, result.getTotalPages());
            
            return result;
        } catch (Exception e) {
            logger.error("Error in API /api/medical-records/doctor/{}", doctorId, e);
            throw e;
        }
    }

    @GetMapping("/doctor/{doctorId}/all")
    public List<MedicalRecord> getRecordsByDoctorIdList(@PathVariable Integer doctorId) {
        return service.getRecordsByDoctorId(doctorId);
    }

    @GetMapping("/test/{doctorId}")
    public String testEndpoint(@PathVariable Integer doctorId) {
        logger.info("Test endpoint called for doctorId: {}", doctorId);
        try {
            List<MedicalRecord> records = service.getRecordsByDoctorId(doctorId);
            logger.info("Test endpoint: Found {} records for doctorId: {}", records.size(), doctorId);
            return "Found " + records.size() + " records for doctor " + doctorId;
        } catch (Exception e) {
            logger.error("Test endpoint error for doctorId: {}", doctorId, e);
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/test/all")
    public String testAllRecords() {
        logger.info("Test all records endpoint called");
        try {
            List<MedicalRecord> records = service.getAllRecords();
            logger.info("Test all records: Found {} total records", records.size());
            return "Found " + records.size() + " total records";
        } catch (Exception e) {
            logger.error("Test all records error", e);
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/test/paginated/{doctorId}")
    public String testPaginated(@PathVariable Integer doctorId) {
        logger.info("Test paginated endpoint called for doctorId: {}", doctorId);
        try {
            Pageable pageable = PageRequest.of(0, 10);
            Page<MedicalRecord> result = service.getRecordsByDoctorIdPaginated(doctorId, pageable);
            logger.info("Test paginated: Found {} records for doctorId: {} (page {} of {})", 
                       result.getContent().size(), doctorId, 
                       result.getNumber() + 1, result.getTotalPages());
            return "Found " + result.getContent().size() + " records for doctor " + doctorId + 
                   " (page " + (result.getNumber() + 1) + " of " + result.getTotalPages() + ")";
        } catch (Exception e) {
            logger.error("Test paginated error for doctorId: {}", doctorId, e);
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/test/paginated-all")
    public String testAllPaginated() {
        logger.info("Test all paginated endpoint called");
        try {
            Pageable pageable = PageRequest.of(0, 10);
            Page<MedicalRecord> result = service.getAllRecordsPaginated(pageable);
            logger.info("Test all paginated: Found {} records (page {} of {})", 
                       result.getContent().size(), 
                       result.getNumber() + 1, result.getTotalPages());
            return "Found " + result.getContent().size() + " records (page " + 
                   (result.getNumber() + 1) + " of " + result.getTotalPages() + ")";
        } catch (Exception e) {
            logger.error("Test all paginated error", e);
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/test/debug")
    public String debugEndpoint() {
        logger.info("Debug endpoint called");
        try {
            List<MedicalRecord> allRecords = service.getAllRecords();
            StringBuilder sb = new StringBuilder();
            sb.append("Total records: ").append(allRecords.size()).append("\n");
            
            for (MedicalRecord record : allRecords) {
                sb.append("Record ID: ").append(record.getRecordId())
                  .append(", Doctor ID: ").append(record.getDoctorId())
                  .append(", Patient ID: ").append(record.getPatientId())
                  .append(", Diagnosis: ").append(record.getDiagnosis())
                  .append("\n");
            }
            
            return sb.toString();
        } catch (Exception e) {
            logger.error("Debug endpoint error", e);
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/test/debug-doctor/{doctorId}")
    public String debugDoctorEndpoint(@PathVariable Integer doctorId) {
        logger.info("Debug doctor endpoint called for doctorId: {}", doctorId);
        try {
            List<MedicalRecord> records = service.getRecordsByDoctorId(doctorId);
            StringBuilder sb = new StringBuilder();
            sb.append("Records for doctor ").append(doctorId).append(": ").append(records.size()).append("\n");
            
            for (MedicalRecord record : records) {
                sb.append("Record ID: ").append(record.getRecordId())
                  .append(", Doctor ID: ").append(record.getDoctorId())
                  .append(", Patient ID: ").append(record.getPatientId())
                  .append(", Diagnosis: ").append(record.getDiagnosis())
                  .append("\n");
            }
            
            return sb.toString();
        } catch (Exception e) {
            logger.error("Debug doctor endpoint error for doctorId: {}", doctorId, e);
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/test/debug-paginated-doctor/{doctorId}")
    public String debugPaginatedDoctorEndpoint(@PathVariable Integer doctorId) {
        logger.info("Debug paginated doctor endpoint called for doctorId: {}", doctorId);
        try {
            Pageable pageable = PageRequest.of(0, 10);
            Page<MedicalRecord> result = service.getRecordsByDoctorIdPaginated(doctorId, pageable);
            StringBuilder sb = new StringBuilder();
            sb.append("Paginated records for doctor ").append(doctorId).append(": ")
              .append(result.getContent().size()).append(" (page ").append(result.getNumber() + 1)
              .append(" of ").append(result.getTotalPages()).append(")\n");
            
            for (MedicalRecord record : result.getContent()) {
                sb.append("Record ID: ").append(record.getRecordId())
                  .append(", Doctor ID: ").append(record.getDoctorId())
                  .append(", Patient ID: ").append(record.getPatientId())
                  .append(", Diagnosis: ").append(record.getDiagnosis())
                  .append("\n");
            }
            
            return sb.toString();
        } catch (Exception e) {
            logger.error("Debug paginated doctor endpoint error for doctorId: {}", doctorId, e);
            return "Error: " + e.getMessage();
        }
    }
}
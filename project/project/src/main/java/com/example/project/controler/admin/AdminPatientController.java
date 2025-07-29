package com.example.project.controler.admin;

import com.example.project.dto.admin.AdminPatientDTO;
import com.example.project.model.Patient;
import com.example.project.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/patients")
public class AdminPatientController {
    @Autowired
    private PatientRepository patientRepository;

    // Lấy danh sách tất cả bệnh nhân
    @GetMapping("")
    public ResponseEntity<List<AdminPatientDTO>> getAllPatients() {
        List<AdminPatientDTO> dtos = patientRepository.findAll().stream()
                .map(p -> new AdminPatientDTO(
                        p.getId(),
                        p.getFullName(),
                        p.getDateOfBirth(),
                        p.getGender(),
                        p.getWeight(),
                        p.getHeight(),
                        p.getStatus()
                ))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    // Thống kê bệnh nhân cho admin
    @GetMapping("/stats")
    public ResponseEntity<?> getPatientStats() {
        List<Patient> all = patientRepository.findAll();
        int total = all.size();
        long male = all.stream().filter(p -> "Male".equalsIgnoreCase(p.getGender()) || "Nam".equalsIgnoreCase(p.getGender())).count();
        long female = all.stream().filter(p -> "Female".equalsIgnoreCase(p.getGender()) || "Nữ".equalsIgnoreCase(p.getGender())).count();
        // Thống kê theo năm sinh
        Map<Integer, Long> byYear = all.stream()
                .filter(p -> p.getDateOfBirth() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        p -> p.getDateOfBirth().getYear(), java.util.stream.Collectors.counting()
                ));
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("total", total);
        result.put("male", male);
        result.put("female", female);
        result.put("byYear", byYear);
        return ResponseEntity.ok(result);
    }

    // Mapping tuyệt đối cho FE: /api/admin/patient-stats
    @GetMapping(path = "/api/admin/patient-stats")
    public ResponseEntity<?> getPatientStatsAliasAbs() {
        return getPatientStats();
    }

    // Cập nhật thông tin bệnh nhân
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePatient(@PathVariable Integer id, @RequestBody AdminPatientDTO updated) {
        Optional<Patient> optional = patientRepository.findById(id);
        if (optional.isEmpty()) return ResponseEntity.notFound().build();
        Patient patient = optional.get();
        patient.setFullName(updated.fullName);
        patient.setDateOfBirth(updated.dateOfBirth);
        patient.setGender(updated.gender);
        patient.setWeight(updated.weight);
        patient.setHeight(updated.height);
        // Không set status nữa vì đã bỏ ở FE
        patientRepository.save(patient);

        // Trả về DTO thay vì entity
        AdminPatientDTO dto = new AdminPatientDTO(
                patient.getId(),
                patient.getFullName(),
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getWeight(),
                patient.getHeight(),
                null // status
        );
        return ResponseEntity.ok(dto);
    }

    // Xóa bệnh nhân
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Integer id) {
        if (!patientRepository.existsById(id)) return ResponseEntity.notFound().build();
        patientRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
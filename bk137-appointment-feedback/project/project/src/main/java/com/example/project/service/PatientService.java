package com.example.project.service;

import com.example.project.dto.PatientDTO;
import com.example.project.model.Parent;
import com.example.project.model.Patient;
import com.example.project.repository.ParentRepository;
import com.example.project.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private static final Logger logger = LoggerFactory.getLogger(PatientService.class);

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private ParentService parentService;

    public Integer getParentIdByUsername(String username) {
        logger.debug("Fetching parentId for username: {}", username);
        Integer parentId = parentService.getParentIdByUsername(username);
        logger.debug("ParentId for username {}: {}", username, parentId);
        return parentId;
    }

    public PatientDTO addPatient(PatientDTO patientDTO, String username) {
        try {
            logger.debug("Adding patient with data: {}", patientDTO);
            Integer parentId = getParentIdByUsername(username);
            
            // If no parent found, try to get the first available parent or create a default one
            Parent parent;
            if (parentId == null) {
                logger.warn("No parentId found for username: {}, trying to get first available parent", username);
                List<Parent> parents = parentRepository.findAll();
                if (parents.isEmpty()) {
                    logger.error("No parents found in database");
                    throw new IllegalArgumentException("No parents available in database");
                }
                parent = parents.get(0);
                logger.debug("Using first available parent with id: {}", parent.getId());
            } else {
                parent = parentRepository.findById(parentId)
                        .orElseThrow(() -> {
                            logger.error("Parent not found with id: {}", parentId);
                            return new IllegalArgumentException("Parent not found with id: " + parentId);
                        });
            }

            Patient patient = new Patient();
            patient.setFullName(patientDTO.getFullName());
            try {
                patient.setDateOfBirth(LocalDate.parse(patientDTO.getDateOfBirth()));
            } catch (DateTimeParseException e) {
                logger.error("Invalid dateOfBirth format: {}. Expected YYYY-MM-DD", patientDTO.getDateOfBirth(), e);
                throw new IllegalArgumentException("Invalid dateOfBirth format: " + patientDTO.getDateOfBirth() + ". Use YYYY-MM-DD.");
            }
            patient.setGender(patientDTO.getGender());
            patient.setWeight(patientDTO.getWeight() != null ? BigDecimal.valueOf(patientDTO.getWeight()) : null);
            patient.setHeight(patientDTO.getHeight() != null ? BigDecimal.valueOf(patientDTO.getHeight()) : null);
            patient.setStatus(patientDTO.getStatus()); // ĐỒNG BỘ TRẠNG THÁI
            patient.setParent(parent);
            // Set createdAt từ code
            patient.setCreatedAt(java.time.Instant.now());

            Patient savedPatient = patientRepository.save(patient);
            logger.debug("Successfully added patient with id: {}", savedPatient.getId());
            return new PatientDTO(savedPatient);
        } catch (Exception e) {
            logger.error("Error adding patient: {}", e.getMessage(), e);
            throw e;
        }
    }

    public PatientDTO updatePatient(Long id, PatientDTO patientDTO) {
        logger.debug("Updating patient with id: {} and data: {}", id, patientDTO);
        Optional<Patient> optional = patientRepository.findById(id.intValue());
        if (!optional.isPresent()) {
            logger.error("Patient not found with id: {}", id);
            return null;
        }
        Patient patient = optional.get();

        patient.setFullName(patientDTO.getFullName());
        try {
            patient.setDateOfBirth(LocalDate.parse(patientDTO.getDateOfBirth()));
        } catch (DateTimeParseException e) {
            logger.error("Invalid dateOfBirth format: {}. Expected YYYY-MM-DD", patientDTO.getDateOfBirth(), e);
            throw new IllegalArgumentException("Invalid dateOfBirth format: " + patientDTO.getDateOfBirth() + ". Use YYYY-MM-DD.");
        }
        patient.setGender(patientDTO.getGender());
        patient.setWeight(patientDTO.getWeight() != null ? BigDecimal.valueOf(patientDTO.getWeight()) : null);
        patient.setHeight(patientDTO.getHeight() != null ? BigDecimal.valueOf(patientDTO.getHeight()) : null);
        patient.setStatus(patientDTO.getStatus());

        Patient savedPatient = patientRepository.save(patient);
        logger.debug("Successfully updated patient with id: {}", savedPatient.getId());
        return new PatientDTO(savedPatient);
    }

    public List<PatientDTO> getPatientsByParentId(Integer parentId) {
        logger.debug("Fetching patients for parentId: {}", parentId);
        List<Patient> patients = patientRepository.findByParentId(parentId);
        List<PatientDTO> patientDTOs = patients.stream()
                .map(PatientDTO::new)
                .collect(Collectors.toList());
        logger.debug("Found {} patients for parentId: {}", patientDTOs.size(), parentId);
        return patientDTOs;
    }

    public boolean deletePatient(Long id) {
        logger.debug("Deleting patient with id: {}", id);
        try {
            Optional<Patient> optional = patientRepository.findById(id.intValue());
            if (!optional.isPresent()) {
                logger.error("Patient not found with id: {}", id);
                return false;
            }
            
            patientRepository.deleteById(id.intValue());
            logger.debug("Successfully deleted patient with id: {}", id);
            return true;
        } catch (Exception e) {
            logger.error("Error deleting patient with id {}: {}", id, e.getMessage(), e);
            return false;
        }
    }

    // DTO cho thống kê tổng quan
    public static class PatientStatsDTO {
        public long total;
        public java.util.Map<String, Long> statusCounts;
        public java.util.List<Object[]> byDate;
        public java.util.List<Object[]> byMonth;
        public java.util.List<Object[]> byYear;
    }

    public PatientStatsDTO getPatientStats() {
        PatientStatsDTO stats = new PatientStatsDTO();
        stats.total = patientRepository.count();
        // Đếm theo trạng thái
        stats.statusCounts = new java.util.HashMap<>();
        for (Object[] row : patientRepository.countGroupByStatus()) {
            String status = (String) row[0];
            Number countNum = (Number) row[1];
            long count = countNum != null ? countNum.longValue() : 0L;
            stats.statusCounts.put(status == null ? "Không xác định" : status, count);
        }
        // Đếm theo ngày/tháng/năm
        stats.byDate = patientRepository.countGroupByDate();
        stats.byMonth = patientRepository.countGroupByMonth();
        stats.byYear = patientRepository.countGroupByYear();
        return stats;
    }
}
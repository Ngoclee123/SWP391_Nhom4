package com.example.project.service;

import com.example.project.dto.DoctorAvailabilityDTO;
import com.example.project.model.DoctorAvailability;
import com.example.project.repository.DoctorAvailabilityRepository;
import com.example.project.repository.DoctorRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.persistence.Query;

@Service
public class DoctorAvailabilityService {
    private static final Logger logger = LoggerFactory.getLogger(DoctorAvailabilityService.class);

    @Autowired
    private DoctorAvailabilityRepository doctorAvailabilityRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public List<DoctorAvailabilityDTO> getByDoctorId(Integer doctorId) {
        logger.info("Fetching all availability for doctorId: {}", doctorId);
        List<DoctorAvailability> availabilities = doctorAvailabilityRepository.findByDoctorId(doctorId);
        List<DoctorAvailabilityDTO> dtos = availabilities.stream()
                .map(DoctorAvailabilityDTO::new)
                .collect(Collectors.toList());
        logger.info("Found {} availability slots for doctorId: {}", dtos.size(), doctorId);
        return dtos;
    }

    public List<DoctorAvailabilityDTO> getAvailableByDoctorId(Integer doctorId) {
        logger.info("Fetching available slots for doctorId: {}", doctorId);
        List<DoctorAvailability> availableSlots = doctorAvailabilityRepository.findByDoctorIdAndStatusIgnoreCase(doctorId, "Available");
        if (availableSlots.isEmpty()) {
            logger.warn("No available slots found with JPA for doctorId: {}. Refreshing session.", doctorId);
            entityManager.clear();
            entityManager.getEntityManagerFactory().getCache().evictAll();
            availableSlots = doctorAvailabilityRepository.findByDoctorIdAndStatusIgnoreCase(doctorId, "Available");
            if (availableSlots.isEmpty()) {
                logger.warn("Still no slots found. Trying native query for doctorId: {}", doctorId);
                availableSlots = doctorAvailabilityRepository.findByDoctorIdAndStatusNative(doctorId, "Available");
                if (availableSlots.isEmpty()) {
                    logger.warn("Still no slots found. Fetching all slots for debug.");
                    List<DoctorAvailability> allSlots = doctorAvailabilityRepository.findAll();
                    for (DoctorAvailability da : allSlots) {
                        logger.info("All slots - doctorId: {}, status: {}", da.getId(), da.getStatus());
                    }
                }
            }
        }
        List<DoctorAvailabilityDTO> dtos = availableSlots.stream()
                .map(DoctorAvailabilityDTO::new)
                .collect(Collectors.toList());
        logger.info("Found {} available slots for doctorId: {}", dtos.size(), doctorId);
        return dtos;
    }

    public DoctorAvailabilityDTO createAvailability(Integer doctorId, DoctorAvailabilityDTO dto) {
        DoctorAvailability availability = new DoctorAvailability();
        // set doctor
        var doctor = doctorRepository.findById(doctorId).orElseThrow(() -> new RuntimeException("Doctor not found"));
        availability.setDoctor(doctor);
        // set các trường khác
        availability.setStartTime(dto.getStartTime());
        availability.setEndTime(dto.getEndTime());
        availability.setStatus(dto.getStatus());
        availability.setCreatedAt(java.time.LocalDateTime.now());
        doctorAvailabilityRepository.save(availability);
        return new DoctorAvailabilityDTO(availability);
    }

    public DoctorAvailabilityDTO updateAvailability(Integer id, DoctorAvailabilityDTO dto) {
        DoctorAvailability availability = doctorAvailabilityRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Not found"));
        if (dto.getStartTime() != null) availability.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) availability.setEndTime(dto.getEndTime());
        if (dto.getStatus() != null) availability.setStatus(dto.getStatus());
        doctorAvailabilityRepository.save(availability);
        return new DoctorAvailabilityDTO(availability);
    }


    public void deleteAvailability(Integer id) {
        if (!doctorAvailabilityRepository.existsById(id)) {
            System.out.println("Không tìm thấy availability với id: " + id);
            return;
        }
        System.out.println("Xóa availability với id: " + id);
        doctorAvailabilityRepository.deleteById(id);
    }

    @Transactional
    public void createAvailabilitySlotsByProcedure(Integer doctorId, LocalDateTime startTime, LocalDateTime endTime, int slotMinutes) {
        Query query = entityManager.createNativeQuery(
            "EXEC InsertDoctorAvailabilitySlots :doctorId, :startTime, :endTime, :slotMinutes"
        );
        query.setParameter("doctorId", doctorId);
        query.setParameter("startTime", startTime);
        query.setParameter("endTime", endTime);
        query.setParameter("slotMinutes", slotMinutes);
        query.executeUpdate();
    }
}
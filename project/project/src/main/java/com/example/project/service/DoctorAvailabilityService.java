package com.example.project.service;

import com.example.project.dto.DoctorAvailabilityDTO;
import com.example.project.dto.DoctorAvailabilitySlotRequest;
import com.example.project.model.DoctorAvailability;
import com.example.project.repository.DoctorAvailabilityRepository;
import com.example.project.repository.DoctorRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.persistence.Query;
import java.util.ArrayList;

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

    public Page<DoctorAvailabilityDTO> getByDoctorIdPaginated(Integer doctorId, Pageable pageable) {
        logger.info("Fetching paginated availability for doctorId: {} with page={}, size={}", 
                   doctorId, pageable.getPageNumber(), pageable.getPageSize());
        Page<DoctorAvailability> availabilities = doctorAvailabilityRepository.findByDoctorId(doctorId, pageable);
        Page<DoctorAvailabilityDTO> dtos = availabilities.map(DoctorAvailabilityDTO::new);
        logger.info("Found {} availability slots for doctorId: {} (page {})", 
                   dtos.getContent().size(), doctorId, pageable.getPageNumber());
        return dtos;
    }

    public List<DoctorAvailabilityDTO> getAvailableByDoctorId(Integer doctorId) {
        logger.info("Fetching available slots for doctorId: {}", doctorId);
        List<DoctorAvailability> availabilities = doctorAvailabilityRepository.findByDoctorIdAndStatusIgnoreCase(doctorId, "Available");
        List<DoctorAvailabilityDTO> dtos = availabilities.stream()
                .map(DoctorAvailabilityDTO::new)
                .collect(Collectors.toList());
        logger.info("Found {} available slots for doctorId: {}", dtos.size(), doctorId);
        return dtos;
    }

    @Transactional
    public DoctorAvailabilityDTO createAvailability(Integer doctorId, DoctorAvailabilityDTO dto) {
        logger.info("Creating availability for doctorId: {}", doctorId);
        
        DoctorAvailability availability = new DoctorAvailability();
        availability.setDoctor(doctorRepository.findById(doctorId).orElseThrow(() -> 
            new RuntimeException("Doctor not found with id: " + doctorId)));
        availability.setStartTime(dto.getStartTime());
        availability.setEndTime(dto.getEndTime());
        availability.setStatus(dto.getStatus());
        
        DoctorAvailability saved = doctorAvailabilityRepository.save(availability);
        logger.info("Created availability with id: {}", saved.getId());
        return new DoctorAvailabilityDTO(saved);
    }

    @Transactional
    public List<DoctorAvailabilityDTO> createAvailabilitySlots(Integer doctorId, DoctorAvailabilitySlotRequest request) {
        logger.info("Creating availability slots for doctorId: {} from {} to {} with {} minute slots", 
                   doctorId, request.getStartTime(), request.getEndTime(), request.getSlotMinutes());
        
        List<DoctorAvailabilityDTO> createdSlots = new ArrayList<>();
        LocalDateTime currentTime = request.getStartTime();
        
        while (currentTime.isBefore(request.getEndTime())) {
            LocalDateTime slotEnd = currentTime.plusMinutes(request.getSlotMinutes());
            if (slotEnd.isAfter(request.getEndTime())) {
                slotEnd = request.getEndTime();
            }
            
            DoctorAvailabilityDTO slotDto = new DoctorAvailabilityDTO();
            slotDto.setStartTime(currentTime);
            slotDto.setEndTime(slotEnd);
            slotDto.setStatus("Available");
            
            DoctorAvailabilityDTO created = createAvailability(doctorId, slotDto);
            createdSlots.add(created);
            
            currentTime = slotEnd;
        }
        
        logger.info("Created {} availability slots for doctorId: {}", createdSlots.size(), doctorId);
        return createdSlots;
    }

    @Transactional
    public DoctorAvailabilityDTO updateAvailability(Integer id, DoctorAvailabilityDTO dto) {
        logger.info("Updating availability with id: {}", id);
        
        DoctorAvailability availability = doctorAvailabilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Availability not found with id: " + id));
        
        availability.setStartTime(dto.getStartTime());
        availability.setEndTime(dto.getEndTime());
        availability.setStatus(dto.getStatus());
        
        DoctorAvailability updated = doctorAvailabilityRepository.save(availability);
        logger.info("Updated availability with id: {}", updated.getId());
        return new DoctorAvailabilityDTO(updated);
    }

    @Transactional
    public void deleteAvailability(Integer id) {
        logger.info("Deleting availability with id: {}", id);
        doctorAvailabilityRepository.deleteById(id);
        logger.info("Deleted availability with id: {}", id);
    }

    @Transactional
    public void createAvailabilitySlotsByProcedure(Integer doctorId, LocalDateTime startTime, LocalDateTime endTime, Integer slotMinutes) {
        logger.info("Creating availability slots using stored procedure for doctorId: {}", doctorId);
        
        String sql = "CALL CreateAvailabilitySlots(?, ?, ?, ?)";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter(1, doctorId);
        query.setParameter(2, startTime);
        query.setParameter(3, endTime);
        query.setParameter(4, slotMinutes);
        
        query.executeUpdate();
        logger.info("Executed stored procedure for doctorId: {}", doctorId);
    }
}
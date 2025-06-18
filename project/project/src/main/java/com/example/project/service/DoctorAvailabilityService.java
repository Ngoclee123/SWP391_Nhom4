package com.example.project.service;

import com.example.project.dto.DoctorAvailabilityDTO;
import com.example.project.model.DoctorAvailability;
import com.example.project.repository.DoctorAvailabilityRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorAvailabilityService {
    private static final Logger logger = LoggerFactory.getLogger(DoctorAvailabilityService.class);

    @Autowired
    private DoctorAvailabilityRepository doctorAvailabilityRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public List<DoctorAvailabilityDTO> getByDoctorId(Integer doctorId) {
        logger.info("Fetching all availability for doctorId: {}", doctorId);
        List<DoctorAvailability> availabilities = doctorAvailabilityRepository.findByDoctorId(doctorId);
        List<DoctorAvailabilityDTO> dtos = availabilities.stream()
                .map(da -> new DoctorAvailabilityDTO(
                        da.getId(),
                        da.getDoctorId(),
                        da.getStartTime(),
                        da.getEndTime(),
                        da.getStatus(),
                        da.getCreatedAt()))
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
                        logger.info("All slots - doctorId: {}, status: {}", da.getDoctorId(), da.getStatus());
                    }
                }
            }
        }
        List<DoctorAvailabilityDTO> dtos = availableSlots.stream()
                .map(da -> new DoctorAvailabilityDTO(
                        da.getId(),
                        da.getDoctorId(),
                        da.getStartTime(),
                        da.getEndTime(),
                        da.getStatus(),
                        da.getCreatedAt()))
                .collect(Collectors.toList());
        logger.info("Found {} available slots for doctorId: {}", dtos.size(), doctorId);
        return dtos;
    }
}
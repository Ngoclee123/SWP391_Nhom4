package com.example.project.service;

import com.example.project.model.VaccineAvailability;
import com.example.project.model.Vaccine;
import com.example.project.repository.VaccineAvailabilityRepository;
import com.example.project.repository.VaccineRepository;
import com.example.project.dto.VaccineAvailabilityDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class VaccineAvailabilityService {
    @Autowired
    private VaccineAvailabilityRepository vaccineAvailabilityRepository;
    @Autowired
    private VaccineRepository vaccineRepository;

    public Page<VaccineAvailabilityDTO> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VaccineAvailability> pageEntity = vaccineAvailabilityRepository.findAll(pageable);
        return new PageImpl<>(
            pageEntity.getContent().stream().map(this::toDTO).collect(Collectors.toList()),
            pageable,
            pageEntity.getTotalElements()
        );
    }

    public Optional<VaccineAvailabilityDTO> getById(Integer id) {
        return vaccineAvailabilityRepository.findById(id).map(this::toDTO);
    }

    public VaccineAvailability create(VaccineAvailability va) {
        // Đảm bảo vaccine tồn tại
        Vaccine vaccine = vaccineRepository.findById(va.getVaccine().getId()).orElseThrow();
        va.setVaccine(vaccine);
        return vaccineAvailabilityRepository.save(va);
    }

    public Optional<VaccineAvailability> update(Integer id, VaccineAvailabilityDTO dto) {
        return vaccineAvailabilityRepository.findById(id).map(existing -> {
            if (dto.getVaccineId() != null) {
                Vaccine vaccine = vaccineRepository.findById(dto.getVaccineId())
                    .orElseThrow(() -> new RuntimeException("Vaccine not found"));
                existing.setVaccine(vaccine);
            }
            if (dto.getAvailableDate() != null) {
                existing.setAvailableDate(dto.getAvailableDate());
            }
            if (dto.getLocation() != null) {
                existing.setLocation(dto.getLocation());
            }
            if (dto.getCapacity() != null) {
                existing.setCapacity(dto.getCapacity());
            }
            return vaccineAvailabilityRepository.save(existing);
        });
    }

    public boolean delete(Integer id) {
        if (!vaccineAvailabilityRepository.existsById(id)) return false;
        vaccineAvailabilityRepository.deleteById(id);
        return true;
    }

    public VaccineAvailabilityDTO toDTO(VaccineAvailability va) {
        return new VaccineAvailabilityDTO(
            va.getId(),
            va.getAvailableDate(),
            va.getLocation(),
            va.getCapacity(),
            va.getVaccine() != null ? va.getVaccine().getId() : null,
            va.getVaccine() != null ? va.getVaccine().getName() : null
        );
    }

    public VaccineAvailability createFromDTO(VaccineAvailabilityDTO dto) {
        Vaccine vaccine = vaccineRepository.findById(dto.getVaccineId())
            .orElseThrow(() -> new RuntimeException("Vaccine not found"));
        VaccineAvailability va = new VaccineAvailability();
        va.setVaccine(vaccine);
        va.setAvailableDate(dto.getAvailableDate());
        va.setLocation(dto.getLocation());
        va.setCapacity(dto.getCapacity());
        return vaccineAvailabilityRepository.save(va);
    }
} 
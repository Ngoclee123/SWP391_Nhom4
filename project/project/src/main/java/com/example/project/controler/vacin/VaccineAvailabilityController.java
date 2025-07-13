package com.example.project.controler.vacin;

import com.example.project.model.VaccineAvailability;
import com.example.project.service.VaccineAvailabilityService;
import com.example.project.dto.VaccineAvailabilityDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/vaccine-availability")
public class VaccineAvailabilityController {
    @Autowired
    private VaccineAvailabilityService vaccineAvailabilityService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<VaccineAvailabilityDTO>> getAll(@RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(vaccineAvailabilityService.getAll(page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VaccineAvailabilityDTO> getById(@PathVariable Integer id) {
        Optional<VaccineAvailabilityDTO> va = vaccineAvailabilityService.getById(id);
        return va.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VaccineAvailabilityDTO> create(@RequestBody VaccineAvailabilityDTO dto) {
        VaccineAvailability created = vaccineAvailabilityService.createFromDTO(dto);
        return ResponseEntity.ok(vaccineAvailabilityService.toDTO(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VaccineAvailabilityDTO> update(@PathVariable Integer id, @RequestBody VaccineAvailabilityDTO dto) {
        Optional<VaccineAvailability> updated = vaccineAvailabilityService.update(id, dto);
        return updated.map(entity -> ResponseEntity.ok(vaccineAvailabilityService.toDTO(entity)))
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        boolean deleted = vaccineAvailabilityService.delete(id);
        if (!deleted) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
} 
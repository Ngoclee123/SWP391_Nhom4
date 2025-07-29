<<<<<<< HEAD
package com.example.project.controler.vacin;

import com.example.project.model.Vaccine;
import com.example.project.repository.VaccineRepository;
import com.example.project.model.Certificate;
import com.example.project.repository.CertificateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vaccines")
public class VaccineController {

    @Autowired
    private VaccineRepository vaccineRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<Vaccine>> getAllVaccines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Vaccine> vaccines = vaccineRepository.findAll(pageable);
        return ResponseEntity.ok(vaccines);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getVaccineById(@PathVariable Integer id) {
        return vaccineRepository.findById(id)
                .map(vaccine -> ResponseEntity.ok(vaccine))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vaccine> createVaccine(@RequestBody Vaccine vaccine) {
        Vaccine saved = vaccineRepository.save(vaccine);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vaccine> updateVaccine(@PathVariable Integer id, @RequestBody Vaccine vaccine) {
        return vaccineRepository.findById(id)
                .map(existing -> {
                    vaccine.setId(id);
                    Vaccine updated = vaccineRepository.save(vaccine);
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVaccine(@PathVariable Integer id) {
        if (!vaccineRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        vaccineRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
=======
package com.example.project.controller;

import com.example.project.model.Vaccine;
import com.example.project.repository.VaccineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vaccines")
public class VaccineController {

    @Autowired
    private VaccineRepository vaccineRepository;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Vaccine>> getAllVaccines() {
        List<Vaccine> vaccines = vaccineRepository.findAll();
        return ResponseEntity.ok(vaccines);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Vaccine> getVaccineById(@PathVariable Integer id) {
        return vaccineRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
>>>>>>> ngocle_new
}
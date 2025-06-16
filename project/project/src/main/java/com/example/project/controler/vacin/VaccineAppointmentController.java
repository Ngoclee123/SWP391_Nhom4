package com.example.project.controler.vacin;

import com.example.project.model.Vaccine;
import com.example.project.model.VaccineAppointment;
import com.example.project.model.VaccineAvailability;
import com.example.project.model.Patient;
import com.example.project.repository.VaccineAppointmentRepository;
import com.example.project.repository.VaccineAvailabilityRepository;
import com.example.project.repository.VaccineRepository;
import com.example.project.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vaccine-appointments")
public class VaccineAppointmentController {

    private static final Logger logger = LoggerFactory.getLogger(VaccineAppointmentController.class);

    @Autowired
    private VaccineAppointmentRepository vaccineAppointmentRepository;

    @Autowired
    private VaccineAvailabilityRepository vaccineAvailabilityRepository;

    @Autowired
    private VaccineRepository vaccineRepository;

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping("/availability/{vaccineId}")
    @PreAuthorize("permitAll()")
    public CompletableFuture<ResponseEntity<Map<String, List<Map<String, Object>>>>> getVaccineAvailability(@PathVariable Integer vaccineId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                List<VaccineAvailability> availability = vaccineAvailabilityRepository.findByVaccineId(vaccineId);
                List<Map<String, Object>> availableSlots = availability.stream()
                        .filter(va -> va.getCapacity() > 0)
                        .map(va -> {
                            Map<String, Object> slot = new HashMap<>();
                            slot.put("available_date", va.getAvailableDate().toString());
                            slot.put("location", va.getLocation());
                            return slot;
                        })
                        .collect(Collectors.toList());
                Map<String, List<Map<String, Object>>> response = new HashMap<>();
                response.put("data", availableSlots);
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                logger.error("Error fetching vaccine availability: {}", e.getMessage());
                return ResponseEntity.status(400).body(null);
            }
        });
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public CompletableFuture<ResponseEntity<String>> createAppointment(@RequestBody Map<String, Object> appointmentData) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Integer patientId = (Integer) appointmentData.get("patientId");
                Integer vaccineId = (Integer) appointmentData.get("vaccineId");
                String appointmentDateStr = (String) appointmentData.get("appointmentDate");
                String location = (String) appointmentData.get("location");
                String notes = (String) appointmentData.get("notes");

                Instant appointmentDate = Instant.parse(appointmentDateStr + "T00:00:00Z");

                // Fetch related entities
                Patient patient = patientRepository.findById(patientId)
                        .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
                Vaccine vaccine = vaccineRepository.findById(vaccineId)
                        .orElseThrow(() -> new IllegalArgumentException("Vaccine not found"));

                // Validate against VaccineAvailability
                VaccineAvailability availability = vaccineAvailabilityRepository.findByVaccineIdAndAvailableDateAndLocation(
                        vaccineId, appointmentDate, location);
                if (availability == null || availability.getCapacity() <= 0) {
                    return ResponseEntity.badRequest().body("Ngày giờ hoặc địa điểm không khả dụng.");
                }

                // Create appointment
                VaccineAppointment appointment = new VaccineAppointment();
                appointment.setPatient(patient);
                appointment.setVaccine(vaccine);
                appointment.setAppointmentDate(appointmentDate);
                appointment.setLocation(location);
                appointment.setStatus("Pending");
                appointment.setNotes(notes);
                appointment.setCreatedAt(Instant.now());

                vaccineAppointmentRepository.save(appointment);

                // Decrease capacity
                availability.setCapacity(availability.getCapacity() - 1);
                vaccineAvailabilityRepository.save(availability);

                return ResponseEntity.ok("Đặt lịch thành công!");
            } catch (Exception e) {
                logger.error("Error creating appointment: {}", e.getMessage());
                return ResponseEntity.status(500).body("Đặt lịch thất bại. Vui lòng thử lại.");
            }
        });
    }
}
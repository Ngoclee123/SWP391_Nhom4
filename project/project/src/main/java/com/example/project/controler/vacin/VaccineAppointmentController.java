package com.example.project.controler.vacin;

import com.example.project.service.VaccineAppointmentService;
import com.example.project.model.VaccineAppointment;
import com.example.project.dto.VaccineAppointmentHistoryDTO;
import com.example.project.dto.VaccineAppointmentDTO;
import com.example.project.dto.VaccineStatisticsDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vaccine-appointments")
public class VaccineAppointmentController {

    private static final Logger logger = LoggerFactory.getLogger(VaccineAppointmentController.class);

    @Autowired
    private VaccineAppointmentService vaccineAppointmentService;

    @GetMapping("/availability/{vaccineId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getVaccineAvailability(@PathVariable Integer vaccineId) {
        return vaccineAppointmentService.getVaccineAvailability(vaccineId);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> createAppointment(@RequestBody VaccineAppointmentRequest appointmentData) {
        return vaccineAppointmentService.createAppointment(appointmentData);
    }

    @GetMapping("/{vaccineAppointmentId}/payment")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getPaymentDetails(@PathVariable Integer vaccineAppointmentId) {
        return vaccineAppointmentService.getPaymentDetails(vaccineAppointmentId);
    }

    @PostMapping("/{vaccineAppointmentId}/refund")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> requestRefund(@PathVariable Integer vaccineAppointmentId) {
        return vaccineAppointmentService.requestRefund(vaccineAppointmentId);
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<VaccineAppointmentHistoryDTO>> getHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        String username = authentication.getName();
        Page<VaccineAppointmentHistoryDTO> historyPage = vaccineAppointmentService.getHistoryByUsername(username, PageRequest.of(page, size));
        return ResponseEntity.ok(historyPage);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<VaccineAppointmentDTO>> getAllAppointments(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(vaccineAppointmentService.getAllAppointments(PageRequest.of(page, size)));
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        boolean ok = vaccineAppointmentService.updateAppointmentStatusOnlyStatus(id, status);
        if (!ok) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Integer id) {
        boolean deleted = vaccineAppointmentService.deleteAppointment(id);
        if (!deleted) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VaccineStatisticsDTO> getVaccineStatistics(@RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(vaccineAppointmentService.getVaccineStatistics(month, year));
    }
}
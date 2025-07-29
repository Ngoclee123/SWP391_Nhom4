package com.example.project.controler;

import com.example.project.dto.FeedbackDTO;
<<<<<<< HEAD

import com.example.project.model.Feedback;
import com.example.project.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/feedbacks")
=======
import com.example.project.model.Feedback;
import com.example.project.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.example.project.model.Appointment;
import com.example.project.model.Patient;
import com.example.project.repository.AppointmentRepository;

@RestController
@RequestMapping("/api/feedback")
>>>>>>> ngocle_new
public class FeedbackController {
    @Autowired
    private FeedbackService feedbackService;

<<<<<<< HEAD
    // Lấy danh sách feedback
    @GetMapping
    public List<Feedback> getAllFeedback() {
        return feedbackService.getAllFeedback();
    }

    // Lấy chi tiết feedback
    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Integer id) {
        Optional<Feedback> feedback = feedbackService.getFeedbackById(id);
        return feedback.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Xóa feedback
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Integer id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }

    // User gửi feedback
    @PostMapping
    public Feedback createFeedback(@RequestBody Feedback feedback) {
        return feedbackService.createFeedback(feedback);
    }

    // Đánh dấu đã đọc
    @PatchMapping("/{id}/read")
    public ResponseEntity<Feedback> markAsRead(@PathVariable Integer id) {
        Feedback feedback = feedbackService.markAsRead(id);
        if (feedback != null) {
            return ResponseEntity.ok(feedback);
        }
        return ResponseEntity.notFound().build();
    }




    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public List<FeedbackDTO> getFeedbacksForDoctor(@PathVariable Integer doctorId) {
        return feedbackService.getFeedbacksForDoctor(doctorId);
    }


}
=======
    @Autowired
    private AppointmentRepository appointmentRepository;

    @PostMapping("/doctor")
    public Feedback addFeedback(@RequestBody FeedbackDTO dto) {
        // Lấy parent_id từ patient_id trong appointment
        if (dto.getAppointmentId() != null) {
            Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
            
            Patient patient = appointment.getPatient();
            if (patient != null) {
                dto.setParentId(patient.getParent().getParentId());
            }
        }
        
        return feedbackService.addFeedback(dto);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<FeedbackDTO> getFeedbacks(@PathVariable Integer doctorId) {
        List<Feedback> feedbacks = feedbackService.getFeedbacksByDoctorId(doctorId);
        List<FeedbackDTO> dtos = feedbacks.stream().map(FeedbackDTO::fromEntity).toList();
        return dtos;
    }
} 
>>>>>>> ngocle_new

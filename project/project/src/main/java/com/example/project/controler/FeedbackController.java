package com.example.project.controler;

import com.example.project.dto.FeedbackDTO;
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
public class FeedbackController {
    @Autowired
    private FeedbackService feedbackService;

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
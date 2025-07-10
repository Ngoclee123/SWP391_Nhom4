package com.example.project.controler;

import com.example.project.dto.FeedbackDTO;
import com.example.project.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {
    @Autowired
    private FeedbackService feedbackService;

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public List<FeedbackDTO> getFeedbacksForDoctor(@PathVariable Integer doctorId) {
        return feedbackService.getFeedbacksForDoctor(doctorId);
    }
}
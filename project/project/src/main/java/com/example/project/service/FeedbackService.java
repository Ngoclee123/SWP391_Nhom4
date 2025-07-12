package com.example.project.service;

import com.example.project.dto.FeedbackDTO;
import com.example.project.model.Feedback;
import java.util.List;

public interface FeedbackService {
    Feedback addFeedback(FeedbackDTO dto);
    List<Feedback> getFeedbacksByDoctorId(Integer doctorId);
} 
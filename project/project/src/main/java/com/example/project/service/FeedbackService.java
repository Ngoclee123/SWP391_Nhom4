package com.example.project.service;

import com.example.project.dto.FeedbackDTO;
import java.util.List;

public interface FeedbackService {
    List<FeedbackDTO> getFeedbacksForDoctor(Integer doctorId);
}
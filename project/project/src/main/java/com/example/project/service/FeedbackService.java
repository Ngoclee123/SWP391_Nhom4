package com.example.project.service;

import com.example.project.dto.FeedbackDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {
   public List<FeedbackDTO> getFeedbacksForDoctor(Integer doctorId) {
        return  getFeedbacksForDoctor(doctorId);
    }
}
package com.example.project.service.impl;

import com.example.project.dto.FeedbackDTO;
import com.example.project.model.Feedback;
import com.example.project.repository.FeedbackRepository;
import com.example.project.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackServiceImpl implements FeedbackService {
    @Autowired
    private FeedbackRepository feedbackRepository;

    @Override
    public List<FeedbackDTO> getFeedbacksForDoctor(Integer doctorId) {
        return feedbackRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private FeedbackDTO toDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setFeedbackId(feedback.getFeedbackId());
        dto.setParentName(feedback.getParent().getFullName());
        dto.setRating(feedback.getRating());
        dto.setComment(feedback.getComment());
        dto.setCreatedAt(feedback.getCreatedAt());
        return dto;
    }
}
package com.example.project.service;

import com.example.project.dto.FeedbackDTO;
import com.example.project.model.Feedback;
<<<<<<< HEAD
import com.example.project.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {
    @Autowired
    private FeedbackRepository feedbackRepository;


   public List<FeedbackDTO> getFeedbacksForDoctor(Integer doctorId) {
        List<Feedback> feedbacks = feedbackRepository.findByDoctorId(doctorId);
        return feedbacks.stream()
            .map(FeedbackDTO::fromEntity)
            .collect(java.util.stream.Collectors.toList());
    }


    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    public Optional<Feedback> getFeedbackById(Integer id) {
        return feedbackRepository.findById(id);
    }

    public void deleteFeedback(Integer id) {
        feedbackRepository.deleteById(id);
    }

    public Feedback markAsRead(Integer id) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(id);
        if (feedbackOpt.isPresent()) {
            Feedback feedback = feedbackOpt.get();
            feedback.setIsRead(true);
            return feedbackRepository.save(feedback);
        }
        return null;
    }

    public Feedback createFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }

}
=======
import java.util.List;

public interface FeedbackService {
    Feedback addFeedback(FeedbackDTO dto);
    List<Feedback> getFeedbacksByDoctorId(Integer doctorId);
} 
>>>>>>> ngocle_new

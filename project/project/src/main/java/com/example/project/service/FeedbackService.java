package com.example.project.service;

import com.example.project.dto.FeedbackDTO;
import com.example.project.model.Feedback;
import com.example.project.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.Instant;
import java.time.LocalDateTime;

import com.example.project.repository.AppointmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class FeedbackService {
    private static final Logger logger = LoggerFactory.getLogger(FeedbackService.class);

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;


   public List<FeedbackDTO> getFeedbacksForDoctor(Integer doctorId) {
        List<Feedback> feedbacks = feedbackRepository.findByDoctorId(doctorId);
        return feedbacks.stream()
            .map(FeedbackDTO::fromEntity)
            .collect(java.util.stream.Collectors.toList());
    }

    public List<FeedbackDTO> getFeedbackByDoctorAndParent(Integer doctorId, Integer parentId) {
        List<Feedback> feedbacks = feedbackRepository.findByDoctorIdAndParentId(doctorId, parentId);
        return feedbacks.stream().map(this::convertToDTO).collect(Collectors.toList());
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

    public FeedbackDTO createFeedback(FeedbackDTO feedbackDTO) {
        logger.info("Creating new feedback: {}", feedbackDTO);
        try {
            validateFeedbackData(feedbackDTO);
            // Kiểm tra parent đã có appointment completed với doctor chưa
            boolean hasCompletedAppointment = appointmentRepository.existsByDoctorIdAndParentIdAndStatus(
                feedbackDTO.getDoctorId(), feedbackDTO.getParentId(), "completed"
            );
            if (!hasCompletedAppointment) {
                throw new IllegalArgumentException("Bạn chỉ có thể đánh giá sau khi đã khám với bác sĩ này.");
            }
            // Kiểm tra đã có feedback cho appointment này chưa (nếu có appointmentId)
            if (feedbackDTO.getAppointmentId() != null) {
                List<Feedback> existingFeedbacks = feedbackRepository.findByAppointmentId(feedbackDTO.getAppointmentId());
                if (!existingFeedbacks.isEmpty()) {
                    throw new IllegalArgumentException("Cuộc hẹn này đã có feedback rồi");
                }
            }
            // Nếu không có appointmentId, kiểm tra parent đã feedback cho doctor này chưa
            List<Feedback> existing = feedbackRepository.findByDoctorIdAndParentId(feedbackDTO.getDoctorId(), feedbackDTO.getParentId());
            if (!existing.isEmpty()) {
                throw new IllegalArgumentException("Bạn đã đánh giá bác sĩ này rồi.");
            }
            Feedback feedback = feedbackDTO.toEntity();
            feedback.setCreatedAt(LocalDateTime.now());
            feedback.setIsRead(false);
            Feedback savedFeedback = feedbackRepository.save(feedback);
            logger.info("Successfully created feedback with ID: {}", savedFeedback.getId());
            return convertToDTO(savedFeedback);
        } catch (Exception e) {
            logger.error("Error creating feedback: {}", feedbackDTO, e);
            throw new RuntimeException("Không thể tạo feedback: " + e.getMessage());
        }
    }

    private FeedbackDTO convertToDTO(Feedback feedback) {
        return FeedbackDTO.fromEntity(feedback);
    }

    private void validateFeedbackData(FeedbackDTO feedbackDTO) {
        if (feedbackDTO.getDoctorId() == null || feedbackDTO.getParentId() == null) {
            throw new IllegalArgumentException("Doctor ID và Parent ID không được để trống.");
        }
        if (feedbackDTO.getRating() == null || feedbackDTO.getRating() < 1 || feedbackDTO.getRating() > 5) {
            throw new IllegalArgumentException("Đánh giá phải từ 1 đến 5.");
        }
        if (feedbackDTO.getComment() == null || feedbackDTO.getComment().trim().isEmpty()) {
            throw new IllegalArgumentException("Bình luận không được để trống.");
        }
    }
}
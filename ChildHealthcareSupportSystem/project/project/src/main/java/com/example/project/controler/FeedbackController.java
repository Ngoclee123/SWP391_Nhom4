package com.example.project.controler;

import com.example.project.dto.FeedbackDTO;

import com.example.project.model.Feedback;
import com.example.project.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {
    private static final Logger logger = LoggerFactory.getLogger(FeedbackController.class);

    @Autowired
    private FeedbackService feedbackService;

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

    /**
     * Tạo feedback mới
     * POST /api/feedbacks
     */
    @PostMapping
    public ResponseEntity<?> createFeedback(@Valid @RequestBody FeedbackDTO feedbackDTO) {
        logger.info("API call: POST /api/feedbacks with data: {}", feedbackDTO);
        try {
            FeedbackDTO createdFeedback = feedbackService.createFeedback(feedbackDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", createdFeedback);
            response.put("message", "Tạo feedback thành công");
            logger.info("Successfully created feedback with ID: {}", createdFeedback.getFeedbackId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid data for creating feedback: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error creating feedback", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Không thể tạo feedback: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
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

    @GetMapping("/doctor/{doctorId}/parent/{parentId}")
    public ResponseEntity<?> getFeedbackByDoctorAndParent(@PathVariable Integer doctorId, @PathVariable Integer parentId) {
        try {
            List<FeedbackDTO> feedbacks = feedbackService.getFeedbackByDoctorAndParent(doctorId, parentId);
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Không thể lấy feedback: " + e.getMessage()));
        }
    }







    //




}
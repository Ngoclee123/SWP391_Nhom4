package com.example.project.controler;

import com.example.project.model.Feedback;
import com.example.project.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {
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
} 
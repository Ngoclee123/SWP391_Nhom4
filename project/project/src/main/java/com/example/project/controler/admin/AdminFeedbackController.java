package com.example.project.controler.admin;

import com.example.project.dto.admin.AdminFeedbackDTO;
import com.example.project.service.admin.AdminFeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/feedbacks")
public class AdminFeedbackController {
    @Autowired
    private AdminFeedbackService adminFeedbackService;

    @GetMapping
    public ResponseEntity<List<AdminFeedbackDTO>> getAllFeedbackForAdmin() {
        List<AdminFeedbackDTO> feedbacks = adminFeedbackService.getAllFeedbackForAdmin();
        return ResponseEntity.ok(feedbacks);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markFeedbackAsRead(@PathVariable Integer id) {
        adminFeedbackService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Integer id) {
        adminFeedbackService.deleteFeedback(id);
        return ResponseEntity.ok().build();
    }
}
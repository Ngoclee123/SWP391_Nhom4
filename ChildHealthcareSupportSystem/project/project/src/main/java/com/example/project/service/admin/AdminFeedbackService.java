package com.example.project.service.admin;

import com.example.project.dto.admin.AdminFeedbackDTO;
import com.example.project.model.Feedback;
import com.example.project.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminFeedbackService {
    @Autowired
    private FeedbackRepository feedbackRepository;

    public List<AdminFeedbackDTO> getAllFeedbackForAdmin() {
        List<Object[]> rows = feedbackRepository.findAllFeedbackWithNamesForAdmin();
        return rows.stream().map(row -> {
            AdminFeedbackDTO dto = new AdminFeedbackDTO();
            dto.setFeedbackId((Integer) row[0]);
            dto.setParentName((String) row[1]);
            dto.setDoctorName((String) row[2]);
            dto.setRating((Integer) row[3]);
            dto.setComment((String) row[4]);
            dto.setCreatedAt(row[5] != null ? ((java.sql.Timestamp) row[5]).toLocalDateTime() : null);
            dto.setIsRead(row[6] != null && (row[6] instanceof Boolean ? (Boolean) row[6] : ((Number) row[6]).intValue() == 1));
            return dto;
        }).collect(Collectors.toList());
    }

    public List<AdminFeedbackDTO> getFeedbackForAdminPaging(int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        List<Object[]> rows = feedbackRepository.findFeedbackWithNamesForAdminPaging(offset, pageSize);
        return rows.stream().map(row -> {
            AdminFeedbackDTO dto = new AdminFeedbackDTO();
            dto.setFeedbackId((Integer) row[0]);
            dto.setParentName((String) row[1]);
            dto.setDoctorName((String) row[2]);
            dto.setRating((Integer) row[3]);
            dto.setComment((String) row[4]);
            dto.setCreatedAt(row[5] != null ? ((java.sql.Timestamp) row[5]).toLocalDateTime() : null);
            dto.setIsRead(row[6] != null && (row[6] instanceof Boolean ? (Boolean) row[6] : ((Number) row[6]).intValue() == 1));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Integer id) {
        feedbackRepository.markAsReadById(id);
    }
    @Transactional
    public void deleteFeedback(Integer id) {
        feedbackRepository.deleteById(id);
    }
}
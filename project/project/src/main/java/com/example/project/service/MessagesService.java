package com.example.project.service;

import com.example.project.model.Messages;
import com.example.project.repository.MessagesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessagesService {

    @Autowired
    private MessagesRepository messagesRepository;

    /**
     * Lấy danh sách tin nhắn giữa người gửi và người nhận dựa trên senderId và receiverId.
     * @param senderId ID của người gửi
     * @param receiverId ID của người nhận
     * @return Danh sách tin nhắn
     */
    public List<Messages> findBySenderIdAndReceiverId(Integer senderId, Integer receiverId) {
        // Lấy tất cả tin nhắn giữa hai người dùng (cả hai chiều)
        List<Messages> messages = messagesRepository.findBySenderIdAndReceiverId(senderId, receiverId);
        if (messages == null || messages.isEmpty()) {
            // Nếu không có tin nhắn theo hướng này, kiểm tra chiều ngược lại
            messages = messagesRepository.findBySenderIdAndReceiverId(receiverId, senderId);
        }
        return messages != null ? messages : List.of();
    }

    public List<Messages> findBySenderId(Integer senderId) {
        return messagesRepository.findBySenderId(senderId);
    }

    public List<Messages> findByReceiverId(Integer receiverId) {
        return messagesRepository.findByReceiverId(receiverId);
    }
}
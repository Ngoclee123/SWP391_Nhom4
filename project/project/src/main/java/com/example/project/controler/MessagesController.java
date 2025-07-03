package com.example.project.controler;

import com.example.project.model.Messages;
import com.example.project.service.MessagesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessagesController {

    @Autowired
    private MessagesService messagesService;

    @GetMapping("/history/{senderId}/{receiverId}")
    public ResponseEntity<Map<String, Object>> getMessageHistory(@PathVariable Integer senderId, @PathVariable Integer receiverId) {
        List<Messages> messages = messagesService.findBySenderIdAndReceiverId(senderId, receiverId);
        Map<String, Object> response = Map.of(
                "data", messages.stream().map(msg -> Map.of(
                        "id", msg.getId(),
                        "sender", msg.getSender().getUsername(),
                        "receiver", msg.getReceiver().getUsername(),
                        "content", msg.getContent(),
                        "sentAt", msg.getSentAt().toString(),
                        "type", "CHAT"
                )).collect(Collectors.toList()),
                "message", messages.isEmpty() ? "Không có tin nhắn nào" : "Lịch sử tin nhắn đã được tải"
        );
        return ResponseEntity.ok(response);
    }
}
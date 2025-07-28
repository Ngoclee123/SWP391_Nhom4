package com.example.project.controler;

import com.example.project.dto.AccountDTO;
import com.example.project.model.Account;
import com.example.project.model.Messages;
import com.example.project.repository.AccountRepository;
import com.example.project.service.MessagesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessagesController {

    @Autowired
    private MessagesService messagesService;

    @Autowired
    private AccountRepository accountRepository;

    @GetMapping("/history/{senderId}/{receiverId}")
    public ResponseEntity<Map<String, Object>> getMessageHistory(@PathVariable Integer senderId, @PathVariable Integer receiverId) {
        List<Messages> messages = messagesService.findBySenderIdAndReceiverId(senderId, receiverId);
        messages.addAll(messagesService.findBySenderIdAndReceiverId(receiverId, senderId)); // Lấy tin nhắn hai chiều
        messages.sort((m1, m2) -> m1.getSentAt().compareTo(m2.getSentAt()));
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

    @GetMapping("/chats/{senderId}")
    public ResponseEntity<Map<String, Object>> getChats(@PathVariable Integer senderId) {
        List<Messages> sentMessages = messagesService.findBySenderId(senderId);
        List<Messages> receivedMessages = messagesService.findByReceiverId(senderId);
        Set<Integer> uniqueAccountIds = new HashSet<>();
        sentMessages.forEach(msg -> uniqueAccountIds.add(msg.getReceiver().getId()));
        receivedMessages.forEach(msg -> uniqueAccountIds.add(msg.getSender().getId()));
        List<AccountDTO> accounts = accountRepository.findAllById(uniqueAccountIds).stream()
                .map(account -> new AccountDTO(account)) // Sử dụng constructor mới
                .collect(Collectors.toList());
        Map<String, Object> response = new HashMap<>();
        response.put("data", accounts);
        response.put("message", accounts.isEmpty() ? "Không có cuộc trò chuyện nào" : "Danh sách cuộc trò chuyện đã được tải");
        return ResponseEntity.ok(response);
    }
}
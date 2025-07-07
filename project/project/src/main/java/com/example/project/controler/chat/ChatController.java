package com.example.project.controler.chat;

import com.example.project.model.Account;
import com.example.project.model.Messages;
import com.example.project.repository.AccountRepository;
import com.example.project.repository.MessagesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessagesRepository messagesRepository;

    @Autowired
    private AccountRepository accountRepository;
    private VideoCallService videoCallService;

    @MessageMapping("/chat.sendPrivateMessage")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String senderUsername = (String) headerAccessor.getSessionAttributes().get("username");
        String receiverUsername = chatMessage.getReceiver();

        Account sender = accountRepository.findByUsername(senderUsername);
        Account receiver = accountRepository.findByUsername(receiverUsername);

        if (sender == null || receiver == null) {
            throw new IllegalArgumentException("Invalid sender or receiver");
        }

        // Lưu tin nhắn vào database
        Messages message = new Messages();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(chatMessage.getContent());
        message.setSentAt(Instant.now());
        message.setIsRead(false);
        Messages savedMessage = messagesRepository.save(message);

        // Gán ID cho ChatMessage để kiểm tra trùng lặp
        chatMessage.setId(savedMessage.getId());

        // Chỉ gửi tin nhắn đến người nhận
        messagingTemplate.convertAndSendToUser(
                receiverUsername,
                "/queue/messages",
                chatMessage
        );

        // Gửi thông báo cho người nhận
        if (chatMessage.getType() == MessageType.CHAT) {
            messagingTemplate.convertAndSendToUser(
                    receiverUsername,
                    "/queue/notifications",
                    new ChatMessage("New message from " + senderUsername, senderUsername, MessageType.NOTIFICATION)
            );
        }
    }

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        if (chatMessage.getType() == MessageType.JOIN) {
            headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        }
        return chatMessage;
    }

    @GetMapping("/history/{senderId}/{receiverId}")
    public ResponseEntity<List<ChatMessage>> getMessageHistory(
            @PathVariable Integer senderId,
            @PathVariable Integer receiverId) {
        List<Messages> messages = messagesRepository.findBySenderIdAndReceiverId(senderId, receiverId);
        messages.addAll(messagesRepository.findBySenderIdAndReceiverId(receiverId, senderId)); // Lấy tin nhắn hai chiều
        messages.sort((m1, m2) -> m1.getSentAt().compareTo(m2.getSentAt())); // Sắp xếp theo thời gian
        List<ChatMessage> chatMessages = messages.stream().map(msg -> ChatMessage.builder()
                .id(msg.getId())
                .content(msg.getContent())
                .sender(msg.getSender().getUsername())
                .receiver(msg.getReceiver().getUsername())
                .type(MessageType.CHAT)
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(chatMessages);
    }


}
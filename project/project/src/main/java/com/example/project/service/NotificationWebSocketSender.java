package com.example.project.service;

import com.example.project.dto.NotificationDTO;
import com.example.project.model.Account;
import com.example.project.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationWebSocketSender {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private AccountRepository accountRepository;

    /**
     * Gửi notification tới user qua websocket (theo username)
     */
    public void sendNotificationToUser(Integer accountId, NotificationDTO notificationDTO) {
        Account account = accountRepository.findById(accountId).orElse(null);
        if (account != null) {
            String username = account.getUsername();
            messagingTemplate.convertAndSendToUser(username, "/queue/notifications", notificationDTO);
        }
    }
} 
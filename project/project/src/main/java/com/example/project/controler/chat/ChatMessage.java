package com.example.project.controler.chat;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    private Integer id; // Thêm trường id
    private String content;
    private String sender;
    private String receiver;
    private MessageType type;

    public ChatMessage(String content, String sender, MessageType type) {
        this.content = content;
        this.sender = sender;
        this.type = type;
    }
}
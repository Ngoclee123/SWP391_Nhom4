package com.example.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.logging.Logger;
import java.util.logging.Level;

@Service
public class EmailService {

    private static final Logger LOGGER = Logger.getLogger(EmailService.class.getName());

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("vanbi12092004@gmail.com");
            message.setTo(to);
            message.setSubject("Yêu cầu đặt lại mật khẩu");
            message.setText("Để đặt lại mật khẩu, vui lòng nhấp vào liên kết sau: \n" +
                    resetLink + "\n" +
                    "Liên kết này sẽ hết hạn vào " + java.time.LocalDateTime.now().plusHours(1) + " (giờ +07).");
            
            LOGGER.log(Level.INFO, "🔄 Đang gửi email reset password đến: {0}", to);
            mailSender.send(message);
            LOGGER.log(Level.INFO, "✅ Email reset password đã gửi thành công đến {0}", to);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "❌ Lỗi khi gửi email reset password đến {0}: {1}", new Object[]{to, e.getMessage()});
            e.printStackTrace();
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        }
    }
}
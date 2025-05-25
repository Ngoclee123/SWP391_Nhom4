package com.example.project.util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.logging.Logger;
import java.util.logging.Level;

@Service
public class Email {

    private static final Logger LOGGER = Logger.getLogger(Email.class.getName());

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String toEmail, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("vanbi12092004@gmail.com");
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            LOGGER.log(Level.INFO, "✅ Email đã gửi thành công đến {0}", toEmail);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "❌ Lỗi khi gửi email đến {0}: {1}", new Object[]{toEmail, e.getMessage()});
            e.printStackTrace();
        }
    }
}

<<<<<<< HEAD
package com.example.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.logging.Logger;
import java.util.logging.Level;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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
                    "Liên kết này sẽ hết hạn vào " + LocalDateTime.now().plusHours(1) + " (giờ +07).");
            
            LOGGER.log(Level.INFO, "🔄 Đang gửi email reset password đến: {0}", to);
            mailSender.send(message);
            LOGGER.log(Level.INFO, "✅ Email reset password đã gửi thành công đến {0}", to);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "❌ Lỗi khi gửi email reset password đến {0}: {1}", new Object[]{to, e.getMessage()});
            e.printStackTrace();
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        }
    }

    public void sendAppointmentConfirmationEmail(String to, String patientName, String doctorName, 
                                               LocalDateTime appointmentTime, double totalFee) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("vanbi12092004@gmail.com");
            message.setTo(to);
            message.setSubject("Xác nhận đặt lịch hẹn khám bệnh");
            
            String formattedTime = appointmentTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            String formattedFee = String.format("%,.0f", totalFee);
            
            message.setText(String.format(
                "Kính gửi %s,\n\n" +
                "Chúng tôi xác nhận đã nhận được yêu cầu đặt lịch hẹn khám bệnh của bạn:\n\n" +
                "📋 Thông tin lịch hẹn:\n" +
                "• Bác sĩ: %s\n" +
                "• Thời gian: %s\n" +
                "• Phí khám: %s VND\n\n" +
                "⏰ Lưu ý:\n" +
                "• Vui lòng đến trước 15 phút so với giờ hẹn\n" +
                "• Mang theo giấy tờ tùy thân và bảo hiểm y tế (nếu có)\n" +
                "• Nếu cần hủy lịch hẹn, vui lòng liên hệ ít nhất 24 giờ trước\n\n" +
                "Cảm ơn bạn đã tin tưởng chúng tôi!\n" +
                "Trân trọng,\n" +
                "Đội ngũ y tế",
                patientName, doctorName, formattedTime, formattedFee
            ));
            
            LOGGER.log(Level.INFO, "🔄 Đang gửi email xác nhận lịch hẹn đến: {0}", to);
            mailSender.send(message);
            LOGGER.log(Level.INFO, "✅ Email xác nhận lịch hẹn đã gửi thành công đến {0}", to);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "❌ Lỗi khi gửi email xác nhận lịch hẹn đến {0}: {1}", 
                new Object[]{to, e.getMessage()});
            e.printStackTrace();
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        }
    }

    public void sendAppointmentReminderEmail(String to, String patientName, String doctorName, 
                                           LocalDateTime appointmentTime) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("vanbi12092004@gmail.com");
            message.setTo(to);
            message.setSubject("Nhắc nhở lịch hẹn khám bệnh");
            
            String formattedTime = appointmentTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            
            message.setText(String.format(
                "Kính gửi %s,\n\n" +
                "Đây là email nhắc nhở về lịch hẹn khám bệnh của bạn:\n\n" +
                "📋 Thông tin lịch hẹn:\n" +
                "• Bác sĩ: %s\n" +
                "• Thời gian: %s\n\n" +
                "⏰ Lưu ý:\n" +
                "• Vui lòng đến trước 15 phút so với giờ hẹn\n" +
                "• Mang theo giấy tờ tùy thân và bảo hiểm y tế (nếu có)\n" +
                "• Nếu không thể đến, vui lòng liên hệ để hủy lịch hẹn\n\n" +
                "Chúc bạn sức khỏe!\n" +
                "Trân trọng,\n" +
                "Đội ngũ y tế",
                patientName, doctorName, formattedTime
            ));
            
            LOGGER.log(Level.INFO, "🔄 Đang gửi email nhắc nhở lịch hẹn đến: {0}", to);
            mailSender.send(message);
            LOGGER.log(Level.INFO, "✅ Email nhắc nhở lịch hẹn đã gửi thành công đến {0}", to);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "❌ Lỗi khi gửi email nhắc nhở lịch hẹn đến {0}: {1}", 
                new Object[]{to, e.getMessage()});
            e.printStackTrace();
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        }
    }

    public void sendAppointmentCancellationEmail(String to, String patientName, String doctorName, 
                                               LocalDateTime appointmentTime) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("vanbi12092004@gmail.com");
            message.setTo(to);
            message.setSubject("Xác nhận hủy lịch hẹn khám bệnh");
            
            String formattedTime = appointmentTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            
            message.setText(String.format(
                "Kính gửi %s,\n\n" +
                "Chúng tôi xác nhận đã hủy lịch hẹn khám bệnh của bạn:\n\n" +
                "📋 Thông tin lịch hẹn đã hủy:\n" +
                "• Bác sĩ: %s\n" +
                "• Thời gian: %s\n\n" +
                "💡 Để đặt lịch hẹn mới, vui lòng truy cập website hoặc liên hệ trực tiếp.\n\n" +
                "Cảm ơn bạn đã thông báo sớm!\n" +
                "Trân trọng,\n" +
                "Đội ngũ y tế",
                patientName, doctorName, formattedTime
            ));
            
            LOGGER.log(Level.INFO, "🔄 Đang gửi email xác nhận hủy lịch hẹn đến: {0}", to);
            mailSender.send(message);
            LOGGER.log(Level.INFO, "✅ Email xác nhận hủy lịch hẹn đã gửi thành công đến {0}", to);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "❌ Lỗi khi gửi email xác nhận hủy lịch hẹn đến {0}: {1}", 
                new Object[]{to, e.getMessage()});
            e.printStackTrace();
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        }
    }
=======
package com.example.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Yêu cầu đặt lại mật khẩu");
        message.setText("Để đặt lại mật khẩu, vui lòng nhấp vào liên kết sau: \n" +
                resetLink + "\n" +
                "Liên kết này sẽ hết hạn vào " + java.time.LocalDateTime.now().plusHours(1) + " (giờ +07).");
        mailSender.send(message);
    }
>>>>>>> ngocle_new
}
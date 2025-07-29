package com.example.project.controler.cartMomo;

import com.example.project.config.MoMoConfig;
import com.example.project.model.Payment;
import com.example.project.model.VaccineAppointment;
import com.example.project.service.PaymentService;
import com.example.project.service.VaccineAppointmentService;
import com.example.project.util.Email;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@RestController
@RequestMapping("/api/momo")
public class MoMoController {
    @Autowired
    private MoMoConfig momoConfig;
    @Autowired
    private VaccineAppointmentService vaccineAppointmentService;
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private Email emailUtil;

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestParam Integer vaccineAppointmentId, @RequestHeader("userId") int userId) {
        try {
            Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentService.getAppointmentById(vaccineAppointmentId);
            if (!appointmentOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Vaccine appointment not found"));
            }
            VaccineAppointment appointment = appointmentOpt.get();
            BigDecimal amount = vaccineAppointmentService.calculateTotalFee(appointment);
            String orderId = appointment.getId() + "_" + System.currentTimeMillis();
            String requestId = momoConfig.getRandomId();
            String orderInfo = "Thanh toan lich hen vaccine: " + orderId;
            String rawData = "accessKey=" + MoMoConfig.accessKey +
                    "&amount=" + amount.longValue() +
                    "&extraData=" + "" +
                    "&ipnUrl=" + MoMoConfig.ipnUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + MoMoConfig.partnerCode +
                    "&redirectUrl=" + MoMoConfig.redirectUrl +
                    "&requestId=" + requestId +
                    "&requestType=captureWallet";
            String signature = momoConfig.hmacSHA256(MoMoConfig.secretKey, rawData);
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("partnerCode", MoMoConfig.partnerCode);
            payload.put("accessKey", MoMoConfig.accessKey);
            payload.put("requestId", requestId);
            payload.put("amount", amount.longValue());
            payload.put("orderId", orderId);
            payload.put("orderInfo", orderInfo);
            payload.put("redirectUrl", MoMoConfig.redirectUrl);
            payload.put("ipnUrl", MoMoConfig.ipnUrl);
            payload.put("extraData", "");
            payload.put("requestType", "captureWallet");
            payload.put("lang", "vi");
            payload.put("signature", signature);
            // Gửi request tới MoMo
            URL url = new URL(MoMoConfig.endpoint);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            String jsonPayload = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload);
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            int code = conn.getResponseCode();
            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
            }
            Map<String, Object> momoResponse = new com.fasterxml.jackson.databind.ObjectMapper().readValue(response.toString(), Map.class);
            if (momoResponse.containsKey("payUrl")) {
                // Lưu trạng thái payment Pending
                Optional<Payment> existingPayment = paymentService.getPaymentByVaccineAppointmentIdAndPaymentMethod(vaccineAppointmentId, "MoMo");
                if (!existingPayment.isPresent()) {
                    Payment payment = new Payment();
                    payment.setPatient(appointment.getPatient());
                    payment.setVaccineAppointment(appointment);
                    payment.setAmount(amount);
                    payment.setPaymentMethod("MoMo");
                    payment.setStatus("Pending");
                    payment.setPaymentDate(Instant.now());
                    payment.setVaccineId(appointment.getVaccine().getId());
                    payment.setParent(appointment.getParent());
                    paymentService.savePayment(payment);
                }
                return ResponseEntity.ok(Map.of("paymentUrl", momoResponse.get("payUrl")));
            } else {
                return ResponseEntity.status(500).body(Map.of("message", "Không tạo được payment MoMo", "response", momoResponse));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi tạo payment MoMo: " + e.getMessage()));
        }
    }

    @PostMapping("/ipn")
    public ResponseEntity<String> handleMomoIpn(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        try {
            String orderId = (String) body.get("orderId");
            String resultCode = String.valueOf(body.get("resultCode"));
            if (orderId == null || !orderId.contains("_")) {
                return ResponseEntity.badRequest().body("Mã giao dịch không hợp lệ!");
            }
            int vaccineAppointmentId = Integer.parseInt(orderId.split("_")[0]);
            if ("0".equals(resultCode)) {
                // Thành công
                vaccineAppointmentService.updateAppointmentStatusOnlyStatus(vaccineAppointmentId, "Pending"); // hoặc "Confirmed" nếu muốn
                Optional<Payment> paymentOpt = paymentService.getPaymentByVaccineAppointmentIdAndPaymentMethod(vaccineAppointmentId, "MoMo");
                Payment payment;
                VaccineAppointment appointment = vaccineAppointmentService.getAppointmentById(vaccineAppointmentId).orElse(null);
                if (paymentOpt.isPresent()) {
                    payment = paymentOpt.get();
                    payment.setStatus("Completed");
                    payment.setPaymentDate(Instant.now());
                    if (appointment != null) {
                        payment.setVaccineId(appointment.getVaccine().getId());
                        payment.setParent(appointment.getParent());
                        payment.setAmount(vaccineAppointmentService.calculateTotalFee(appointment));
                        payment.setPaymentMethod("MoMo");
                    }
                } else {
                    payment = new Payment();
                    if (appointment != null) {
                        payment.setPatient(appointment.getPatient());
                        payment.setVaccineAppointment(appointment);
                        payment.setAmount(vaccineAppointmentService.calculateTotalFee(appointment));
                        payment.setPaymentMethod("MoMo");
                        payment.setStatus("Completed");
                        payment.setPaymentDate(Instant.now());
                        payment.setVaccineId(appointment.getVaccine().getId());
                        payment.setParent(appointment.getParent());
                    }
                }
                paymentService.savePayment(payment);
                // Gửi email xác nhận nếu có
                if (appointment != null && appointment.getPatient() != null && appointment.getPatient().getParent() != null) {
                    var parent = appointment.getPatient().getParent();
                    var account = parent.getAccount();
                    if (account != null && account.getEmail() != null) {
                        String email = account.getEmail();
                        String subject = "Xác nhận thanh toán lịch hẹn thành công qua MoMo";
                        String content = "Chào " + (account.getFullName() != null ? account.getFullName() : "Khách hàng") + ",\n\n"
                                + "Cảm ơn bạn đã đặt lịch hẹn tại HealthCare Portal!\n"
                                + "Mã lịch hẹn: " + vaccineAppointmentId + "\n"
                                + "Tổng phí: " + (payment.getAmount() != null ? payment.getAmount() : "Chưa xác định") + " VNĐ\n\n"
                                + "Lịch hẹn của bạn đã được thanh toán thành công và sẽ sớm được xử lý.\n\n"
                                + "Trân trọng,\nHealthCare Team";
                        emailUtil.sendEmail(email, subject, content);
                    }
                }
                return ResponseEntity.ok("success");
            } else {
                vaccineAppointmentService.updateAppointmentStatusOnlyStatus(vaccineAppointmentId, "Pending");
                return ResponseEntity.ok("fail");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi xử lý IPN MoMo: " + e.getMessage());
        }
    }

    @GetMapping("/return")
    public ResponseEntity<String> handleMomoReturn(@RequestParam Map<String, String> params) {
        try {
            String orderId = params.get("orderId");
            String resultCode = params.get("resultCode");
            if (orderId == null || !orderId.contains("_")) {
                return ResponseEntity.badRequest().body("Mã giao dịch không hợp lệ!");
            }
            int vaccineAppointmentId = Integer.parseInt(orderId.split("_")[0]);
            String redirectUrl;
            if ("0".equals(resultCode)) {
                redirectUrl = "http://localhost:3000/paymentpage?vaccineAppointmentId=" + vaccineAppointmentId + "&result=success";
            } else {
                redirectUrl = "http://localhost:3000/paymentpage?vaccineAppointmentId=" + vaccineAppointmentId + "&result=fail";
            }
            String html = "<html><head>"
                    + "<meta http-equiv='refresh' content='0; URL=" + redirectUrl + "' />"
                    + "<script>window.location.href='" + redirectUrl + "';</script>"
                    + "</head><body>If you are not redirected, <a href='" + redirectUrl + "'>click here</a>.</body></html>";
            return ResponseEntity.ok().body(html);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi xử lý return MoMo: " + e.getMessage());
        }
    }
} 
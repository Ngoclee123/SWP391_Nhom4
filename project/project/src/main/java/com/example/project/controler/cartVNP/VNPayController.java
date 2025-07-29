package com.example.project.controler.cartVNP;

import com.example.project.config.VNPayConfig;
import com.example.project.controler.vacin.VaccineAppointmentRequest;
import com.example.project.dto.vnp.VNPayResponseDTO;
<<<<<<< HEAD
import com.example.project.model.*;
=======
import com.example.project.model.Account;
import com.example.project.model.VaccineAppointment;
import com.example.project.model.Payment;
import com.example.project.model.Refund;
>>>>>>> ngocle_new
import com.example.project.service.AccountService;
import com.example.project.service.VaccineAppointmentService;
import com.example.project.service.PaymentService;
import com.example.project.service.RefundService;
import com.example.project.util.Email;

import jakarta.servlet.http.HttpServletRequest;
<<<<<<< HEAD
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
=======
>>>>>>> ngocle_new
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/vnpay")
public class VNPayController {

<<<<<<< HEAD
    private static final Logger logger = LoggerFactory.getLogger(VNPayController.class);

=======
>>>>>>> ngocle_new
    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private VaccineAppointmentService vaccineAppointmentService;

    @Autowired
    private AccountService accountService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RefundService refundService;

    @Autowired
<<<<<<< HEAD
    private Email emailUtil;

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(HttpServletRequest request, @RequestParam Integer vaccineAppointmentId, @RequestParam String paymentMethod, @RequestParam(required = false) String bankCode, @RequestHeader("userId") int userId) {
        try {
            logger.debug("Creating payment for vaccineAppointmentId: {}, method: {}, bankCode: {}", vaccineAppointmentId, paymentMethod, bankCode);
            VaccineAppointment appointment = vaccineAppointmentService.getAppointmentById(vaccineAppointmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Vaccine appointment not found"));

            if ("Cash".equalsIgnoreCase(paymentMethod)) {
                Optional<Payment> existingPayment = paymentService.getPaymentByVaccineAppointmentIdAndPaymentMethod(vaccineAppointmentId, "Cash");
                Payment payment;
                if (existingPayment.isPresent()) {
                    payment = existingPayment.get();
                } else {
                    payment = new Payment();
                    payment.setPatient(appointment.getPatient());
                    payment.setVaccineAppointment(appointment);
                    payment.setAmount(vaccineAppointmentService.calculateTotalFee(appointment));
                    payment.setPaymentMethod("Cash");
                    payment.setStatus("Pending");
                    payment.setPaymentDate(Instant.now());
                    payment.setVaccineId(appointment.getVaccine().getId());
                    payment.setParent(appointment.getParent());
                    paymentService.savePayment(payment);
                }
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Đặt lịch thành công. Thanh toán sẽ được xử lý sau.");
                response.put("data", Map.of(
                    "vaccineName", appointment.getVaccine().getName(),
                    "amount", payment.getAmount(),
                    "status", payment.getStatus()
                ));
                return ResponseEntity.ok(response);
            } else if ("BankCard".equalsIgnoreCase(paymentMethod)) {
                // Tạo payment với status Pending nếu chưa có
                Optional<Payment> existingPayment = paymentService.getPaymentByVaccineAppointmentIdAndPaymentMethod(vaccineAppointmentId, "BankCard");
                if (!existingPayment.isPresent()) {
                    Payment payment = new Payment();
                    payment.setPatient(appointment.getPatient());
                    payment.setVaccineAppointment(appointment);
                    payment.setAmount(vaccineAppointmentService.calculateTotalFee(appointment));
                    payment.setPaymentMethod("BankCard");
                    payment.setStatus("Pending");
                    payment.setPaymentDate(Instant.now());
                    payment.setVaccineId(appointment.getVaccine().getId());
                    payment.setParent(appointment.getParent());
                    paymentService.savePayment(payment);
                }
                String vnp_Version = "2.1.0";
                String vnp_Command = "pay";
                String orderType = "appointment";
                BigDecimal amount = vaccineAppointmentService.calculateTotalFee(appointment);
                long vnp_Amount = amount.multiply(BigDecimal.valueOf(100)).longValue();
                String vnp_TxnRef = appointment.getId() + "_" + System.currentTimeMillis();
                String vnp_IpAddr = vnPayConfig.getIpAddress(request);
                String vnp_TmnCode = VNPayConfig.vnp_TmnCode;

                Map<String, String> vnp_Params = new HashMap<>();
                vnp_Params.put("vnp_Version", vnp_Version);
                vnp_Params.put("vnp_Command", vnp_Command);
                vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
                vnp_Params.put("vnp_Amount", String.valueOf(vnp_Amount));
                vnp_Params.put("vnp_CurrCode", "VND");

                if (bankCode != null && !bankCode.isEmpty()) {
                    vnp_Params.put("vnp_BankCode", bankCode);
                }

                vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
                vnp_Params.put("vnp_OrderInfo", "Thanh toan lich hen: " + vnp_TxnRef);
                vnp_Params.put("vnp_OrderType", orderType);
                vnp_Params.put("vnp_Locale", "vn");
                vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
                vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

                Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
                SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
                String vnp_CreateDate = formatter.format(cld.getTime());
                vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

                cld.add(Calendar.MINUTE, 15);
                String vnp_ExpireDate = formatter.format(cld.getTime());
                vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

                List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
                Collections.sort(fieldNames);
                StringBuilder hashData = new StringBuilder();
                StringBuilder query = new StringBuilder();
                Iterator<String> itr = fieldNames.iterator();
                while (itr.hasNext()) {
                    String fieldName = itr.next();
                    String fieldValue = vnp_Params.get(fieldName);
                    if (fieldValue != null && !fieldValue.isEmpty()) {
                        hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                        query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII)).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                        if (itr.hasNext()) {
                            query.append('&');
                            hashData.append('&');
                        }
                    }
                }
                String queryUrl = query.toString();
                String vnp_SecureHash = vnPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData.toString());
                queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
                String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl;

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Tạo URL thanh toán VNPay thành công!");
                response.put("data", Map.of("paymentUrl", paymentUrl, "vaccineName", appointment.getVaccine().getName(), "amount", amount));
                return ResponseEntity.ok(response);
            } else {
                throw new IllegalArgumentException("Invalid payment method");
            }
        } catch (IllegalArgumentException e) {
            logger.error("Validation error in createPayment: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (SecurityException e) {
            logger.error("Security error in createPayment: {}", e.getMessage());
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized: No authenticated user."));
        } catch (Exception e) {
            logger.error("Error in createPayment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi tạo thanh toán: " + e.getMessage()));
=======
    private Email emailService;

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(HttpServletRequest request, @RequestBody VaccineAppointmentRequest requestDTO, @RequestHeader("userId") int userId) {
        try {
            VaccineAppointment appointment = vaccineAppointmentService.createVaccineAppointment(requestDTO).join();

            if ("later".equals(requestDTO.getPaymentMethod())) {
                Payment payment = new Payment();
                payment.setPatient(appointment.getPatient());
                payment.setVaccineAppointment(appointment);
                payment.setAmount(new BigDecimal(calculateTotalFee(appointment)));
                payment.setPaymentMethod(requestDTO.getPaymentMethod());
                payment.setStatus("Pending");
                payment.setPaymentDate(Instant.now());
                paymentService.savePayment(payment);

                return ResponseEntity.ok("Đặt lịch thành công. Thanh toán sẽ được xử lý sau.");
            }

            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String orderType = "appointment";
            long amount = (long) (calculateTotalFee(appointment) * 100);
            String vnp_TxnRef = appointment.getId() + "_" + System.currentTimeMillis();
            String vnp_IpAddr = vnPayConfig.getIpAddress(request);
            String vnp_TmnCode = VNPayConfig.vnp_TmnCode;

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount));
            vnp_Params.put("vnp_CurrCode", "VND");

            if (requestDTO.getBankCode() != null && !requestDTO.getBankCode().isEmpty()) {
                vnp_Params.put("vnp_BankCode", requestDTO.getBankCode());
            }

            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", "Thanh toan lich hen:" + vnp_TxnRef);
            vnp_Params.put("vnp_OrderType", orderType);
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII)).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
            String queryUrl = query.toString();
            String vnp_SecureHash = vnPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl;

            VNPayResponseDTO responseDTO = new VNPayResponseDTO();
            responseDTO.setPaymentUrl(paymentUrl);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tạo thanh toán: " + e.getMessage());
>>>>>>> ngocle_new
        }
    }

    @GetMapping("/return")
    public ResponseEntity<String> handleVNPayReturn(HttpServletRequest request) {
        try {
            Map<String, String> fields = new HashMap<>();
            for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
                String fieldName = URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII);
                String fieldValue = URLEncoder.encode(entry.getValue()[0], StandardCharsets.US_ASCII);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    fields.put(fieldName, fieldValue);
                }
            }

            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            fields.remove("vnp_SecureHashType");
            fields.remove("vnp_SecureHash");

            String signValue = vnPayConfig.hashAllFields(fields);
            if (!signValue.equals(vnp_SecureHash)) {
<<<<<<< HEAD
                logger.warn("Invalid secure hash: expected {}, got {}", signValue, vnp_SecureHash);
=======
>>>>>>> ngocle_new
                return ResponseEntity.badRequest().body("Chữ ký không hợp lệ!");
            }

            String paymentCode = request.getParameter("vnp_TransactionNo");
            String vaccineAppointmentIdStr = request.getParameter("vnp_TxnRef");
<<<<<<< HEAD
            if (vaccineAppointmentIdStr == null || !vaccineAppointmentIdStr.contains("_")) {
                logger.error("Invalid vnp_TxnRef format: {}", vaccineAppointmentIdStr);
                return ResponseEntity.badRequest().body("Mã giao dịch không hợp lệ!");
            }
            vaccineAppointmentIdStr = vaccineAppointmentIdStr.split("_")[0];
            int vaccineAppointmentId = Integer.parseInt(vaccineAppointmentIdStr);

            Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentService.getAppointmentById(vaccineAppointmentId);
            if (!appointmentOpt.isPresent()) {
                logger.error("Vaccine appointment not found for id: {}", vaccineAppointmentId);
=======
            if (vaccineAppointmentIdStr != null && vaccineAppointmentIdStr.contains("_")) {
                vaccineAppointmentIdStr = vaccineAppointmentIdStr.split("_")[0];
            }
            int vaccineAppointmentId = Integer.parseInt(vaccineAppointmentIdStr);

            Optional<VaccineAppointment> appointmentOpt = vaccineAppointmentService.getAppointmentById(vaccineAppointmentId).join();
            if (!appointmentOpt.isPresent()) {
>>>>>>> ngocle_new
                return ResponseEntity.badRequest().body("Vaccine appointment not found");
            }
            VaccineAppointment appointment = appointmentOpt.get();

<<<<<<< HEAD
            String transactionStatus = request.getParameter("vnp_TransactionStatus");
            String redirectUrl;
            if ("00".equals(transactionStatus)) {
                vaccineAppointmentService.updateAppointmentStatusOnlyStatus(vaccineAppointmentId, "Pending"); // hoặc "Confirmed" nếu muốn
                Optional<Payment> paymentOpt = paymentService.getPaymentByVaccineAppointmentId(vaccineAppointmentId);
                Payment payment;
                if (paymentOpt.isPresent()) {
                    payment = paymentOpt.get();
                    payment.setStatus("Completed");
                    payment.setPaymentDate(Instant.now());
                    payment.setVaccineId(appointment.getVaccine().getId());
                    payment.setParent(appointment.getParent());
                    payment.setAmount(vaccineAppointmentService.calculateTotalFee(appointment));
                    payment.setPaymentMethod("BankCard");
                } else {
                    // Nếu chưa có payment, tạo mới
                    payment = new Payment();
                    payment.setPatient(appointment.getPatient());
                    payment.setVaccineAppointment(appointment);
                    payment.setAmount(vaccineAppointmentService.calculateTotalFee(appointment));
                    payment.setPaymentMethod("BankCard");
                    payment.setStatus("Completed");
                    payment.setPaymentDate(Instant.now());
                    payment.setVaccineId(appointment.getVaccine().getId());
                    payment.setParent(appointment.getParent());
                }
                paymentService.savePayment(payment);

                // Gửi email xác nhận
                Patient patient = appointment.getPatient();
                if (patient != null && patient.getParent() != null) {
                    Parent parent = patient.getParent();
                    Account account = parent.getAccount();
                    if (account != null && account.getEmail() != null) {
                        String email = account.getEmail();
                        String subject = "Xác nhận thanh toán lịch hẹn thành công qua VNPay";
                        String content = "Chào " + (account.getFullName() != null ? account.getFullName() : "Khách hàng") + ",\n\n"
                                + "Cảm ơn bạn đã đặt lịch hẹn tại HealthCare Portal!\n"
                                + "Mã lịch hẹn: " + vaccineAppointmentId + "\n"
                                + "Mã giao dịch VNPay: " + paymentCode + "\n"
                                + "Tổng phí: " + (payment.getAmount() != null ? payment.getAmount() : "Chưa xác định") + " VNĐ\n\n"
                                + "Lịch hẹn của bạn đã được thanh toán thành công và sẽ sớm được xử lý.\n\n"
                                + "Trân trọng,\nHealthCare Team";
                        
                        logger.info("🔄 Đang gửi email xác nhận thanh toán đến: {}", email);
                        emailUtil.sendEmail(email, subject, content);
                        logger.info("✅ Email xác nhận thanh toán đã gửi thành công đến: {}", email);
                    } else {
                        logger.warn("❌ Không tìm thấy email cho patient ID: {}", patient.getId());
                    }
                } else {
                    logger.warn("❌ Không tìm thấy parent hoặc patient cho appointment ID: {}", vaccineAppointmentId);
                }
                redirectUrl = "http://localhost:3000/paymentpage?vaccineAppointmentId=" + vaccineAppointmentId + "&result=success";
            } else {
                vaccineAppointmentService.updateAppointmentStatus(vaccineAppointmentId, "Pending");
                redirectUrl = "http://localhost:3000/paymentpage?vaccineAppointmentId=" + vaccineAppointmentId + "&result=fail";
            }
            String html = "<html><head>"
                + "<meta http-equiv='refresh' content='0; URL=" + redirectUrl + "' />"
                + "<script>window.location.href='" + redirectUrl + "';</script>"
                + "</head><body>If you are not redirected, <a href='" + redirectUrl + "'>click here</a>.</body></html>";
            return ResponseEntity.ok().body(html);
        } catch (NumberFormatException e) {
            logger.error("Invalid number format in vnp_TxnRef: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Mã giao dịch không hợp lệ!");
        } catch (IllegalArgumentException e) {
            logger.error("Validation error in handleVNPayReturn: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error in handleVNPayReturn: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Lỗi khi xử lý trả về: " + e.getMessage());
        }
    }
}
=======
            if ("00".equals(request.getParameter("vnp_TransactionStatus"))) {
                vaccineAppointmentService.updateAppointmentStatus(vaccineAppointmentId, "Paid").join();
                Optional<Payment> paymentOpt = Optional.ofNullable(vaccineAppointmentService.getPaymentByVaccineAppointmentId(vaccineAppointmentId).join());
                Payment payment = paymentOpt.orElseThrow(() -> new IllegalArgumentException("Payment not found"));
                payment.setStatus("Completed");
                payment.setPaymentDate(Instant.now());
                paymentService.savePayment(payment);

                Account patient = accountService.getAccountById(appointment.getPatient().getId());
                String email = patient.getEmail();

                String subject = "Xác nhận thanh toán lịch hẹn thành công qua VNPay";
                String content = "Chào " + patient.getFullName() + ",\n\n"
                        + "Cảm ơn bạn đã đặt lịch hẹn tại HealthCare Portal!\n"
                        + "Mã lịch hẹn: " + vaccineAppointmentId + "\n"
                        + "Mã giao dịch VNPay: " + paymentCode + "\n"
                        + "Tổng phí: " + payment.getAmount() + " VNĐ\n\n"
                        + "Lịch hẹn của bạn đã được thanh toán thành công và sẽ sớm được xử lý.\n\n"
                        + "Trân trọng,\nHealthCare Team";
                emailService.sendEmail(email, subject, content);
                return ResponseEntity.ok("Thanh toán thành công!");
            } else {
                vaccineAppointmentService.updateAppointmentStatus(vaccineAppointmentId, "Pending").join();
                return ResponseEntity.ok("Thanh toán thất bại!");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xử lý trả về: " + e.getMessage());
        }
    }

    @PostMapping("/request-refund")
    public ResponseEntity<String> requestRefund(@RequestParam("vaccineAppointmentId") int vaccineAppointmentId) {
        try {
            Optional<Payment> paymentOpt = Optional.ofNullable(vaccineAppointmentService.getPaymentByVaccineAppointmentId(vaccineAppointmentId).join());
            if (!paymentOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Payment not found");
            }
            Payment payment = paymentOpt.get();
            if (!"Completed".equals(payment.getStatus())) {
                return ResponseEntity.badRequest().body("Không thể yêu cầu hoàn tiền cho lịch hẹn này.");
            }

            Refund refund = new Refund();
            refund.setPayment(payment);
            refund.setAmount(payment.getAmount());
            refund.setReason("Yêu cầu hoàn tiền từ khách hàng");
            refund.setStatus("Pending");
            refundService.saveRefund(refund);

            return ResponseEntity.ok("Yêu cầu hoàn tiền đã được gửi thành công.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi yêu cầu hoàn tiền: " + e.getMessage());
        }
    }

    private double calculateTotalFee(VaccineAppointment appointment) {
        // Logic to calculate total fee (e.g., based on vaccine cost)
        return 100000.0; // Placeholder, replace with actual logic
    }
}
>>>>>>> ngocle_new

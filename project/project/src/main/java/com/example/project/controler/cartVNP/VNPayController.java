//package com.example.project.controler.cartVNP;
//import com.example.project.config.VNPayConfig;
//import com.example.project.dto.AppointmentRequestDTO;
//import com.example.project.dto.vnp.VNPayResponseDTO;
//import com.example.project.model.Account;
//import com.example.project.model.Appointment;
//import com.example.project.service.AccountService;
//import com.example.project.service.AppointmentService;
//import com.example.project.util.Email;
//import jakarta.servlet.http.HttpServletRequest;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.net.URLEncoder;
//import java.nio.charset.StandardCharsets;
//import java.text.SimpleDateFormat;
//import java.util.*;
//
//@RestController
//@RequestMapping("/api/vnpay")
//public class VNPayController {
//
//    @Autowired
//    private VNPayConfig vnPayConfig;
//
//    @Autowired
//    private AppointmentService appointmentService;
//
//    @Autowired
//    private AccountService accountService;
//
//    @Autowired
//    private Email emailService;
//
//    @PostMapping("/create-payment")
//    public ResponseEntity<VNPayResponseDTO> createPayment(HttpServletRequest request, @RequestBody AppointmentRequestDTO requestDTO, @RequestHeader("userId") int userId) {
//        // Tạo lịch hẹn trước khi tạo URL thanh toán
//        Appointment appointment = appointmentService.createAppointment(userId, requestDTO);
//
//        String vnp_Version = "2.1.0";
//        String vnp_Command = "pay";
//        String orderType = "appointment";
//        long amount = (long) (requestDTO.getTotalFee() * 100);
//        String vnp_TxnRef = appointment.getAppointmentId() + "_" + System.currentTimeMillis();
//        String vnp_IpAddr = vnPayConfig.getIpAddress(request);
//        String vnp_TmnCode = VNPayConfig.vnp_TmnCode;
//
//        Map<String, String> vnp_Params = new HashMap<>();
//        vnp_Params.put("vnp_Version", vnp_Version);
//        vnp_Params.put("vnp_Command", vnp_Command);
//        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
//        vnp_Params.put("vnp_Amount", String.valueOf(amount));
//        vnp_Params.put("vnp_CurrCode", "VND");
//
//        if (requestDTO.getBankCode() != null && !requestDTO.getBankCode().isEmpty()) {
//            vnp_Params.put("vnp_BankCode", requestDTO.getBankCode());
//        }
//        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
//        vnp_Params.put("vnp_OrderInfo", "Thanh toan lich hen:" + vnp_TxnRef);
//        vnp_Params.put("vnp_OrderType", orderType);
//        vnp_Params.put("vnp_Locale", "vn");
//        vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
//        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
//
//        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
//        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
//        String vnp_CreateDate = formatter.format(cld.getTime());
//        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
//
//        cld.add(Calendar.MINUTE, 15);
//        String vnp_ExpireDate = formatter.format(cld.getTime());
//        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
//
//        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
//        Collections.sort(fieldNames);
//        StringBuilder hashData = new StringBuilder();
//        StringBuilder query = new StringBuilder();
//        Iterator<String> itr = fieldNames.iterator();
//        while (itr.hasNext()) {
//            String fieldName = itr.next();
//            String fieldValue = vnp_Params.get(fieldName);
//            if (fieldValue != null && !fieldValue.isEmpty()) {
//                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
//                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII)).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
//                if (itr.hasNext()) {
//                    query.append('&');
//                    hashData.append('&');
//                }
//            }
//        }
//        String queryUrl = query.toString();
//        String vnp_SecureHash = vnPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData.toString());
//        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
//        String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl;
//
//        VNPayResponseDTO responseDTO = new VNPayResponseDTO();
//        responseDTO.setPaymentUrl(paymentUrl);
//        return ResponseEntity.ok(responseDTO);
//    }
//
//    @GetMapping("/return")
//    public ResponseEntity<String> handleVNPayReturn(HttpServletRequest request) {
//        Map<String, String> fields = new HashMap<>();
//        for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
//            String fieldName = URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII);
//            String fieldValue = URLEncoder.encode(entry.getValue()[0], StandardCharsets.US_ASCII);
//            if (fieldValue != null && !fieldValue.isEmpty()) {
//                fields.put(fieldName, fieldValue);
//            }
//        }
//
//        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
//        fields.remove("vnp_SecureHashType");
//        fields.remove("vnp_SecureHash");
//
//        String signValue = vnPayConfig.hashAllFields(fields);
//        if (signValue.equals(vnp_SecureHash)) {
//            String paymentCode = request.getParameter("vnp_TransactionNo");
//            String appointmentIdStr = request.getParameter("vnp_TxnRef");
//            if (appointmentIdStr != null && appointmentIdStr.contains("_")) {
//                appointmentIdStr = appointmentIdStr.split("_")[0];
//            }
//            int appointmentId = Integer.parseInt(appointmentIdStr);
//
//            if ("00".equals(request.getParameter("vnp_TransactionStatus"))) {
//                appointmentService.updateAppointmentStatus(appointmentId, "Paid");
//
//                Appointment appointment = appointmentService.getAppointmentById(appointmentId);
//                Account patient = accountService.getAccountById(appointment.getPatientId());
//                String email = patient.getEmail();
//
//                String subject = "Xác nhận thanh toán lịch hẹn thành công qua VNPay";
//                String content = "Chào " + patient.getFullName() + ",\n\n"
//                        + "Cảm ơn bạn đã đặt lịch hẹn tại HealthCare Portal!\n"
//                        + "Mã lịch hẹn: " + appointmentId + "\n"
//                        + "Mã giao dịch VNPay: " + paymentCode + "\n"
//                        + "Tổng phí: " + appointment.getTotalFee() + " VNĐ\n\n"
//                        + "Lịch hẹn của bạn đã được thanh toán thành công và sẽ sớm được xử lý.\n\n"
//                        + "Trân trọng,\n HealthCare Team";
//                emailService.sendEmail(email, subject, content);
//                return ResponseEntity.ok("Thanh toán thành công!");
//            } else {
//                appointmentService.updateAppointmentStatus(appointmentId, "Pending");
//                return ResponseEntity.ok("Thanh toán thất bại!");
//            }
//        } else {
//            return ResponseEntity.badRequest().body("Chữ ký không hợp lệ!");
//        }
//    }
//}

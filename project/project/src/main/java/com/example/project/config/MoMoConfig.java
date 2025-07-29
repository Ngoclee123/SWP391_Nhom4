package com.example.project.config;

import org.springframework.stereotype.Component;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class MoMoConfig {
    public static String endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
    public static String partnerCode = "MOMO";
    public static String accessKey = "F8BBA842ECF85";
    public static String secretKey = "K951B6PE1waDMi640x08PD3vg6EkVLz";
    public static String redirectUrl = "http://localhost:8080/api/momo/return";
    public static String ipnUrl = "http://localhost:8080/api/momo/ipn";

    public String hmacSHA256(String key, String data) {
        try {
            Mac hmac256 = Mac.getInstance("HmacSHA256");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            SecretKeySpec secretKeySpec = new SecretKeySpec(hmacKeyBytes, "HmacSHA256");
            hmac256.init(secretKeySpec);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac256.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    public String getRandomId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
} 
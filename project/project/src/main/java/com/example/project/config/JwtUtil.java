<<<<<<< Updated upstream
package com.example.project.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets; // THÊM IMPORT NÀY
import java.util.Date;

@Component
public class JwtUtil {

    // SỬA LẠI ĐÚNG 2 DÒNG NÀY
    private final String secretString = "DayLaChuoiBiMatSieuDaiVaAnToanCuaToiDeMaHoaJWTChoDuAnBabyHealthHubCuaNhom4";
    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));

    // GIỮ NGUYÊN CÁC HÀM CŨ CỦA BẠN
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 giờ

    public String generateToken(String username, Integer accountId) {
        return Jwts.builder()
                .setSubject(username)
                .claim("accountId", accountId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS512)
                .compact();
    }

    public String extractUsername(String token) {
        // Lưu ý: Nếu phiên bản thư viện jjwt của bạn mới, có thể cần đổi thành .parserBuilder()...
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public Integer extractAccountId(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
        return claims.get("accountId", Integer.class);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            // Dòng này sẽ không còn bị gọi nữa sau khi bạn đăng nhập lại
            System.out.println("JWT validation failed: " + e.getMessage());
            return false;
        }
    }
=======
package com.example.project.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    private final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS512);
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 giờ

    public String generateToken(String username, Integer accountId, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("accountId", accountId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS512)
                .compact();
    }

    public String extractUsername(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public Integer extractAccountId(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
        return claims.get("accountId", Integer.class);
    }

    public String extractRole(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
        return claims.get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            System.out.println("JWT validation failed: " + e.getMessage());
            return false;
        }
    }
>>>>>>> Stashed changes
}
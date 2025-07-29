<<<<<<< HEAD
package com.example.project.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private final String SECRET = "mySuperSecretKeyForJwtToken1234567890mySuperSecretKeyForJwtToken1234567890abcd";
    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes());

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 giờ

    public String generateToken(String username, Integer accountId, String role) {
        logger.debug("Generating token with secret: {}", SECRET_KEY.toString().substring(0, 5) + "...");
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
        Claims claims = parseClaims(token);
        return claims.getSubject();
    }

    public Integer extractAccountId(String token) {
        Claims claims = parseClaims(token);
        return claims.get("accountId", Integer.class);
    }

    public String extractRole(String token) {
        Claims claims = parseClaims(token);
        return claims.get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parseClaims(token);
            Date expirationDate = claims.getExpiration();
            boolean isValid = expirationDate.after(new Date()) && claims.getSubject() != null;
            logger.debug("Token validated for subject: {}, expiration: {}, valid: {}", claims.getSubject(), expirationDate, isValid);
            return isValid;
        } catch (Exception e) {
            logger.error("JWT validation failed: {}", e.getMessage(), e);
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

//    public Map<String, String> generateTokens(String username, Integer accountId, String role) {
//        String token = generateToken(username, accountId, role);
//        String refreshToken = generateRefreshToken(username, accountId, role); // Hàm tạo refresh token
//        return Map.of("token", token, "refreshToken", refreshToken);
//    }
//
//    public String generateRefreshToken(String username, Integer accountId, String role) {
//        return Jwts.builder()
//                .setSubject(username)
//                .claim("accountId", accountId)
//                .claim("role", role)
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000)) // 7 ngày
//                .signWith(SECRET_KEY, SignatureAlgorithm.HS512)
//                .compact();
//    }
=======
package com.example.project.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private final String SECRET = "mySuperSecretKeyForJwtToken1234567890mySuperSecretKeyForJwtToken1234567890abcd";
    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes());

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 giờ

    public String generateToken(String username, Integer accountId, String role) {
        logger.debug("Generating token with secret: {}", SECRET_KEY.toString().substring(0, 5) + "...");
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
        Claims claims = parseClaims(token);
        return claims.getSubject();
    }

    public Integer extractAccountId(String token) {
        Claims claims = parseClaims(token);
        return claims.get("accountId", Integer.class);
    }

    public String extractRole(String token) {
        Claims claims = parseClaims(token);
        return claims.get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parseClaims(token);
            Date expirationDate = claims.getExpiration();
            boolean isValid = expirationDate.after(new Date()) && claims.getSubject() != null;
            logger.debug("Token validated for subject: {}, expiration: {}, valid: {}", claims.getSubject(), expirationDate, isValid);
            return isValid;
        } catch (Exception e) {
            logger.error("JWT validation failed: {}", e.getMessage(), e);
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

//    public Map<String, String> generateTokens(String username, Integer accountId, String role) {
//        String token = generateToken(username, accountId, role);
//        String refreshToken = generateRefreshToken(username, accountId, role); // Hàm tạo refresh token
//        return Map.of("token", token, "refreshToken", refreshToken);
//    }
//
//    public String generateRefreshToken(String username, Integer accountId, String role) {
//        return Jwts.builder()
//                .setSubject(username)
//                .claim("accountId", accountId)
//                .claim("role", role)
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000)) // 7 ngày
//                .signWith(SECRET_KEY, SignatureAlgorithm.HS512)
//                .compact();
//    }
>>>>>>> ngocle_new
}
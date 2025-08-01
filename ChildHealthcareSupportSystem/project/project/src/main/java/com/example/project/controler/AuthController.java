package com.example.project.controler;

import com.example.project.config.JwtUtil;
import com.example.project.dto.NewPasswordDTO;
import com.example.project.dto.RegisterRequestDTO;
import com.example.project.dto.ResetPasswordRequestDTO;
import com.example.project.model.Account;
import com.example.project.service.AccountService;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AccountService accountService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login/admin")
    public ResponseEntity<?> loginAdmin(@RequestBody LoginRequest loginRequest) {
        logger.info("Admin login attempt for username: {}", loginRequest.getUsername());
        return handleLogin(loginRequest, "ADMIN");
    }

    @PostMapping("/login/user")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        logger.info("User login attempt for username: {}", loginRequest.getUsername());
        return handleLogin(loginRequest, "USER");
    }

    @PostMapping("/login/doctor")
    public ResponseEntity<?> loginDoctor(@RequestBody LoginRequest loginRequest) {
        logger.info("Doctor login attempt for username: {}", loginRequest.getUsername());
        return handleLogin(loginRequest, "DOCTOR");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        logger.info("General login attempt for username: {}", loginRequest.getUsername());
        return handleGeneralLogin(loginRequest);
    }

    private ResponseEntity<?> handleGeneralLogin(LoginRequest loginRequest) {
        Account account = accountService.findByUsername(loginRequest.getUsername());
        if (account == null) {
            logger.warn("Login failed: Username {} not found", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Username not found");
        }

        if (!account.getStatus()) {
            logger.warn("Login failed: Account {} is disabled", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Account is disabled");
        }

        if (passwordEncoder.matches(loginRequest.getPassword(), account.getPasswordHash())) {
            String role = account.getRole().getRolename();
            String token = jwtUtil.generateToken(account.getUsername(), account.getId(), role);
            logger.info("Login successful for username: {}, role: {}, token: {}", loginRequest.getUsername(), role, token);
            return ResponseEntity.ok(new AuthResponse(token, account.getUsername(), account.getFullName(), account.getId(), role));
        } else {
            logger.warn("Login failed: Invalid password for username {}. Raw: {}, Stored: {}",
                    loginRequest.getUsername(), loginRequest.getPassword(), account.getPasswordHash());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }
    }

    private ResponseEntity<?> handleLogin(LoginRequest loginRequest, String expectedRole) {
        Account account = accountService.findByUsername(loginRequest.getUsername());
        if (account == null) {
            logger.warn("Login failed: Username {} not found", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Username not found");
        }

        if (!account.getStatus()) {
            logger.warn("Login failed: Account {} is disabled", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Account is disabled");
        }

        if (!account.getRole().getRolename().equals(expectedRole)) {
            logger.warn("Login failed: Role mismatch for username {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Invalid role");
        }

        if (passwordEncoder.matches(loginRequest.getPassword(), account.getPasswordHash())) {
            String token = jwtUtil.generateToken(account.getUsername(), account.getId(), expectedRole);
            logger.info("Login successful for username: {}, token: {}", loginRequest.getUsername(), token);
            return ResponseEntity.ok(new AuthResponse(token, account.getUsername(), account.getFullName(), account.getId(), expectedRole));
        } else {
            logger.warn("Login failed: Invalid password for username {}. Raw: {}, Stored: {}",
                    loginRequest.getUsername(), loginRequest.getPassword(), account.getPasswordHash());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO request) {
        logger.info("Registration attempt for username: {}", request.getUsername());

        try {
            Account account = accountService.registerAccount(request);
            String role = account.getRole().getRolename();
            String token = jwtUtil.generateToken(account.getUsername(), account.getId(), role);
            logger.info("Registration successful for username: {}, token: {}", account.getUsername(), token);
            return ResponseEntity.ok(new AuthResponse(token, account.getUsername(), account.getFullName(), account.getId(), role));
        } catch (RuntimeException e) {
            logger.warn("Registration failed for username: {} - Error: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ResetPasswordRequestDTO request) {
        logger.info("Password reset request for username: {}", request.getUsername());
        try {
            accountService.requestPasswordReset(request);
            return ResponseEntity.ok("Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn");
        } catch (RuntimeException e) {
            logger.warn("Password reset failed for username: {} - Error: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody NewPasswordDTO request) {
        logger.info("Password reset attempt with token: {}", request.getToken());
        try {
            boolean success = accountService.resetPassword(request);
            if (!success) {
                logger.warn("Invalid or expired token: {}", request.getToken());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token không hợp lệ hoặc đã hết hạn");
            }
            return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công");
        } catch (RuntimeException e) {
            logger.warn("Password reset failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/login")
    public ResponseEntity<?> loginNotAllowed() {
        logger.warn("GET method not allowed on /login endpoint");
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body("GET method not allowed on /login");
    }


//    @PostMapping("/refresh-token")
//    public ResponseEntity<Map<String, String>> refreshToken(@RequestBody Map<String, String> request) {
//        String refreshToken = request.get("refreshToken");
//        if (jwtUtil.validateToken(refreshToken)) {
//            Claims claims = jwtUtil.parseClaims(refreshToken);
//            String username = claims.getSubject();
//            Integer accountId = claims.get("accountId", Integer.class);
//            String role = claims.get("role", String.class);
//            Map<String, String> tokens = jwtUtil.generateTokens(username, accountId, role);
//            return ResponseEntity.ok(tokens);
//        }
//        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//    }
}

class LoginRequest {
    private String username;
    private String password;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

class AuthResponse {
    private String token;
    private String username;
    private String fullName;
    private Integer accountId;
    private String role;

    public AuthResponse(String token, String username, String fullName, Integer accountId, String role) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.accountId = accountId;
        this.role = role;
    }

    public Integer getAccountId() { return accountId; }
    public void setAccountId(Integer accountId) { this.accountId = accountId; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}

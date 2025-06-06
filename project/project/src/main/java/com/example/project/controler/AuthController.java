package com.example.project.controler;

import com.example.project.config.JwtUtil;
import com.example.project.dto.RegisterRequestDTO;
import com.example.project.model.Account;
import com.example.project.service.AccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for username: {}", loginRequest.getUsername());

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
            String token = jwtUtil.generateToken(account.getUsername(), account.getId()); // Tạo token với accountId
            logger.info("Login successful for username: {}, token: {}", loginRequest.getUsername(), token);
            return ResponseEntity.ok(new AuthResponse(token, account.getUsername(), account.getFullName(), account.getId()));
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
            // Gọi phương thức registerAccount từ AccountService
            Account account = accountService.registerAccount(request);
            String token = jwtUtil.generateToken(account.getUsername(), account.getId()); // Tạo token sau khi đăng ký
            logger.info("Registration successful for username: {}, token: {}", account.getUsername(), token);
            return ResponseEntity.ok(new AuthResponse(token, account.getUsername(), account.getFullName(), account.getId()));
        } catch (RuntimeException e) {
            logger.warn("Registration failed for username: {} - Error: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    @GetMapping("/login")
    public ResponseEntity<?> loginNotAllowed() {
        logger.warn("GET method not allowed on /login endpoint");
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body("GET method not allowed on /login");
    }
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

    public AuthResponse(String token, String username, String fullName , Integer accountId) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.accountId = accountId; // Gán accountId
    }
    public Integer getAccountId() { return accountId; }
    public void setAccountId(Integer accountId) { this.accountId = accountId; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}

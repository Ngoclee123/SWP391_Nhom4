package com.example.project.controler;

import com.example.project.config.JwtUtil;
import com.example.project.dto.NewPasswordDTO;
import com.example.project.dto.RegisterRequestDTO;
import com.example.project.dto.ResetPasswordRequestDTO;
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tên đăng nhập không tồn tại");
        }

        if (!account.getStatus()) {
            logger.warn("Login failed: Account {} is disabled", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản đã bị vô hiệu hóa");
        }

        if (passwordEncoder.matches(loginRequest.getPassword(), account.getPasswordHash())) {
            String token = jwtUtil.generateToken(account.getUsername(), account.getId());
            logger.info("Login successful for username: {}, token: {}", loginRequest.getUsername(), token);
            return ResponseEntity.ok(new AuthResponse(
                    token,
                    null, // refreshToken nếu đã triển khai
                    account.getUsername(),
                    account.getFullName(),
                    account.getId(),
                    account.getRole().getId(), // Thêm role_id
                    account.getRole().getRolename() // Thêm rolename
            ));
        } else {
            logger.warn("Login failed: Invalid password for username {}. Raw: {}, Stored: {}",
                    loginRequest.getUsername(), loginRequest.getPassword(), account.getPasswordHash());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mật khẩu không đúng");
        }
    }

    // ... Các phương thức khác (register, forgot-password, reset-password, refresh-token) giữ nguyên
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
    private Integer roleId; // Thêm role_id
    private String roleName; // Thêm rolename

    public AuthResponse(String token, String refreshToken, String username, String fullName, Integer accountId, Integer roleId, String roleName) {
        this.token = token;

        this.username = username;
        this.fullName = fullName;
        this.accountId = accountId;
        this.roleId = roleId;
        this.roleName = roleName;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Integer getAccountId() { return accountId; }
    public void setAccountId(Integer accountId) { this.accountId = accountId; }
    public Integer getRoleId() { return roleId; }
    public void setRoleId(Integer roleId) { this.roleId = roleId; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
}
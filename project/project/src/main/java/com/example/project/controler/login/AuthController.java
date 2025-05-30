package com.example.project.controler.login;

import com.example.project.config.JwtUtil;
import com.example.project.model.Account;
import com.example.project.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Account loginRequest) {
        Account account = accountService.findByUsername(loginRequest.getUsername());
        if (account != null && passwordEncoder.matches(loginRequest.getPasswordHash(), account.getPasswordHash())) {
            String token = jwtUtil.generateToken(account.getUsername());
            return ResponseEntity.ok(new AuthResponse(token));
        }
            return ResponseEntity.status(401).body("Invalid credentials");
    }

    @GetMapping("/login")
    public ResponseEntity<?> loginNotAllowed() {
        return ResponseEntity.status(405).body("GET method not allowed on /login");
    }

}

class AuthResponse {
    private String token;

    public AuthResponse(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}

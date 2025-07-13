package com.example.project.controler;

import com.example.project.model.Account;
import com.example.project.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private AccountRepository accountRepository;

    @GetMapping("/password")
    public String testPassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String rawPassword = "123456";
        String storedHash = "$2a$10$7tJrcOd/Nt5FEJ8Zysrw5uJ8asJ7aBpVq/P9lKAzgIWVvtf8ElTQO";
        
        boolean matches = encoder.matches(rawPassword, storedHash);
        
        return String.format("""
            Testing password: %s
            Stored hash: %s
            Password matches: %s
            """, rawPassword, storedHash, matches);
    }

    @GetMapping("/update-sarah-password")
    public String updateSarahPassword() {
        try {
            Account sarahAccount = accountRepository.findByUsername("sarah_lee");
            if (sarahAccount == null) {
                return "User sarah_lee not found";
            }
            
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            String newPasswordHash = encoder.encode("123456");
            
            sarahAccount.setPasswordHash(newPasswordHash);
            accountRepository.save(sarahAccount);
            
            return String.format("""
                Updated sarah_lee password successfully!
                New hash: %s
                Test with '123456': %s
                """, newPasswordHash, encoder.matches("123456", newPasswordHash));
        } catch (Exception e) {
            return "Error updating password: " + e.getMessage();
        }
    }
} 
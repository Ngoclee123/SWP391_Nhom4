package com.example.project.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String rawPassword = "123456";
        String storedHash = "$2a$10$7tJrcOd/Nt5FEJ8Zysrw5uJ8asJ7aBpVq/P9lKAzgIWVvtf8ElTQO";
        
        System.out.println("Testing password: " + rawPassword);
        System.out.println("Stored hash: " + storedHash);
        
        boolean matches = encoder.matches(rawPassword, storedHash);
        System.out.println("Password matches: " + matches);
        
        // Generate new hash for comparison
        String newHash = encoder.encode(rawPassword);
        System.out.println("New hash for '123456': " + newHash);
        
        // Test with new hash
        boolean newMatches = encoder.matches(rawPassword, newHash);
        System.out.println("New hash matches: " + newMatches);
    }
} 
package com.example.project.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHasher {

    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /**
     * Hashes a plain text password using BCrypt.
     * @param password The plain text password to hash.
     * @return The hashed password, or null if an error occurs.
     */
    public static String hashPassword(String password) {
        try {
            return encoder.encode(password);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Checks if a plain text password matches a hashed password.
     * @param rawPassword The plain text password to check.
     * @param hashedPassword The hashed password to compare against.
     * @return True if the passwords match, false otherwise.
     */
    public static boolean checkPassword(String rawPassword, String hashedPassword) {
        try {
            return encoder.matches(rawPassword, hashedPassword);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Main method to test the PasswordHasher.
     * @param args Command line arguments (not used).
     */
    public static void main(String[] args) {
        // Test with some passwords
        String[] passwords = {"123456", "password123", "securePass!2025"};
        for (String password : passwords) {
            String hashed = hashPassword(password);
            System.out.println("Password: " + password + " -> Hashed: " + hashed);
            System.out.println("Check '123456' against hash: " + checkPassword("123456", hashed));
            System.out.println("------------------------");
        }
    }
}

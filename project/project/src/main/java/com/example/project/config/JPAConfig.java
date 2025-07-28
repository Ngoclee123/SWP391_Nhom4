package com.example.project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Cấu hình JPA cơ bản cho ứng dụng
 */
@Configuration
@EnableTransactionManagement
@EnableAspectJAutoProxy
public class JPAConfig {
    // Không cần cấu hình thêm vì Spring Boot sẽ tự động cấu hình 
    // EntityManagerFactory và các thành phần JPA khác
} 
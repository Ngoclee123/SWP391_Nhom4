package com.example.project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Tự động tìm đường dẫn đến thư mục avatars
        String avatarsPath = findAvatarsPath();
        String imagesPath = findImagesPath();
        
        System.out.println("=== Resource Path Configuration ===");
        System.out.println("Current working directory: " + System.getProperty("user.dir"));
        System.out.println("Configured avatars path: " + avatarsPath);
        System.out.println("Configured images path: " + imagesPath);
        System.out.println("====================================");
        
        registry.addResourceHandler("/avatars/**")
                .addResourceLocations(avatarsPath)
                .setCachePeriod(3600); // Cache 1 giờ
                
        registry.addResourceHandler("/images/**")
                .addResourceLocations(imagesPath)
                .setCachePeriod(3600); // Cache 1 giờ
    }
    
    private String findAvatarsPath() {
        String currentDir = System.getProperty("user.dir");
        
        // Các pattern đường dẫn có thể có - đơn giản và an toàn
        String[] searchPatterns = {
            currentDir + "/front-end/public/avatars/",
            currentDir + "/../front-end/public/avatars/",
            currentDir + "/../../front-end/public/avatars/",
            currentDir + "/avatars/"
        };
        
        // Tìm đường dẫn đầu tiên tồn tại
        for (String pattern : searchPatterns) {
            try {
                Path testPath = Paths.get(pattern);
                if (testPath.toFile().exists() && testPath.toFile().isDirectory()) {
                    String absolutePath = testPath.toAbsolutePath().toString();
                    String fileUrl = "file:///" + absolutePath.replace("\\", "/") + "/";
                    System.out.println("Found avatars directory: " + fileUrl);
                    return fileUrl;
                }
            } catch (Exception e) {
                System.err.println("Error checking path: " + pattern + ", Error: " + e.getMessage());
            }
        }
        
        // Fallback: tạo thư mục avatars trong thư mục hiện tại
        try {
            String fallbackPath = currentDir + "/avatars/";
            Path fallbackDir = Paths.get(fallbackPath);
            if (!fallbackDir.toFile().exists()) {
                fallbackDir.toFile().mkdirs();
                System.out.println("Created fallback avatars directory: " + fallbackPath);
            }
            
            String fileUrl = "file:///" + fallbackDir.toAbsolutePath().toString().replace("\\", "/") + "/";
            System.out.println("Using fallback avatars path: " + fileUrl);
            return fileUrl;
        } catch (Exception e) {
            System.err.println("Error creating fallback directory: " + e.getMessage());
            // Fallback cuối cùng
            return "file:///" + currentDir.replace("\\", "/") + "/avatars/";
        }
    }
    
    private String findImagesPath() {
        String currentDir = System.getProperty("user.dir");
        
        // Các pattern đường dẫn có thể có cho thư mục images
        String[] searchPatterns = {
            currentDir + "/front-end/public/images/",
            currentDir + "/../front-end/public/images/",
            currentDir + "/../../front-end/public/images/",
            currentDir + "/images/"
        };
        
        // Tìm đường dẫn đầu tiên tồn tại
        for (String pattern : searchPatterns) {
            try {
                Path testPath = Paths.get(pattern);
                if (testPath.toFile().exists() && testPath.toFile().isDirectory()) {
                    String absolutePath = testPath.toAbsolutePath().toString();
                    String fileUrl = "file:///" + absolutePath.replace("\\", "/") + "/";
                    System.out.println("Found images directory: " + fileUrl);
                    return fileUrl;
                }
            } catch (Exception e) {
                System.err.println("Error checking images path: " + pattern + ", Error: " + e.getMessage());
            }
        }
        
        // Fallback: tạo thư mục images trong thư mục hiện tại
        try {
            String fallbackPath = currentDir + "/images/";
            Path fallbackDir = Paths.get(fallbackPath);
            if (!fallbackDir.toFile().exists()) {
                fallbackDir.toFile().mkdirs();
                System.out.println("Created fallback images directory: " + fallbackPath);
            }
            
            String fileUrl = "file:///" + fallbackDir.toAbsolutePath().toString().replace("\\", "/") + "/";
            System.out.println("Using fallback images path: " + fileUrl);
            return fileUrl;
        } catch (Exception e) {
            System.err.println("Error creating fallback images directory: " + e.getMessage());
            // Fallback cuối cùng
            return "file:///" + currentDir.replace("\\", "/") + "/images/";
        }
    }
}
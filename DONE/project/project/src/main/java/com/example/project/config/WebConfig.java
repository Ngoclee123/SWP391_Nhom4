package com.example.project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Đường dẫn tương đối từ thư mục chạy BE lên front-end/public/avatars
        String avatarsPath = "file:///" + System.getProperty("user.dir").replace("\\", "/") + "/../front-end/public/avatars/";
        registry.addResourceHandler("/avatars/**")
                .addResourceLocations(avatarsPath);
    }
}
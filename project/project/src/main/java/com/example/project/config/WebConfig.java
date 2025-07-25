package com.example.project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//@Configuration
//public class WebConfig implements WebMvcConfigurer {
//    @Override
//    public void addResourceHandlers(ResourceHandlerRegistry registry) {
//        // Đường dẫn tuyệt đối tới thư mục avatars (chuẩn hóa cho Windows)
//        String avatarsPath = "file:///" + System.getProperty("user.dir").replace("\\", "/") + "/../front-end/public/avatars/";
//        registry.addResourceHandler("/avatars/**")
//                .addResourceLocations(avatarsPath);
//    }
//}

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/avatars/**")
                .addResourceLocations("file:/D:/Ky5/front-end/public/avatars/");
    }
}
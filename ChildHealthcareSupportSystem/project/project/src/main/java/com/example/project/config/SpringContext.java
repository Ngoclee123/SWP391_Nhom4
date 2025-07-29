package com.example.project.config;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

/**
 * Lớp tiện ích cung cấp truy cập đến Spring ApplicationContext từ bất kỳ nơi nào trong ứng dụng.
 * Hữu ích cho các trường hợp không thể sử dụng Dependency Injection thông thường,
 * như Entity Listeners hoặc các lớp được tạo bởi cơ chế khác.
 */
@Component
public class SpringContext implements ApplicationContextAware {

    private static ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        SpringContext.applicationContext = applicationContext;
    }

    /**
     * Trả về bean được quản lý bởi Spring ApplicationContext.
     *
     * @param beanClass Lớp của bean cần lấy
     * @param <T> Kiểu của bean
     * @return Bean được yêu cầu
     */
    public static <T> T getBean(Class<T> beanClass) {
        return applicationContext.getBean(beanClass);
    }
    
    /**
     * Trả về bean được quản lý bởi Spring ApplicationContext theo tên.
     *
     * @param beanName Tên của bean cần lấy
     * @return Bean được yêu cầu
     */
    public static Object getBean(String beanName) {
        return applicationContext.getBean(beanName);
    }
} 
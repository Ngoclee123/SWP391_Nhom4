<<<<<<< Updated upstream
package com.example.project.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // THÊM IMPORT NÀY
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return bCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // SỬA DÒNG NÀY
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // CÁC ENDPOINT CÔNG KHAI
                        .requestMatchers("/api/login", "/api/register", "/api/vnpay/**", "/ws/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/doctors/**", "/api/parents/**", "/api/accounts/**", "/api/doctor-availability/**", "/api/appointments/doctor/**").permitAll()

                        // CÁC ENDPOINT CẦN XÁC THỰC
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/{id}/status").hasAnyRole("DOCTOR", "ADMIN") // YÊU CẦU VAI TRÒ

                        // TẤT CẢ CÁC REQUEST CÒN LẠI CẦN XÁC THỰC
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
                        })
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
=======
package com.example.project.config;

import com.example.project.controler.loginGG.GoogleOAuth2SuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean("securityTaskExecutor")
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setTaskDecorator(runnable -> {
            return () -> {
                var context = SecurityContextHolder.createEmptyContext();
                var authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null) {
                    context.setAuthentication(authentication);
                }
                SecurityContextHolder.setContext(context);
                try {
                    runnable.run();
                } finally {
                    SecurityContextHolder.clearContext();
                }
            };
        });
        executor.initialize();
        return executor;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/login/**", "/api/register", "/oauth2/authorization/google",
                                "/login/oauth2/code/*", "/login", "/oauth2/redirect",
                                "/api/vnpay/**", "/api/doctors", "/api/doctors/**", "/api/reset-password",
                                "/api/forgot-password", "/ws/**", "/api/doctors/specialties",
                                "/api/doctors/specialty/**", "/api/accounts/username/**", "/api/messages/history/**").permitAll()
                        .requestMatchers("/api/vaccines/**", "/api/parents/patients/**").authenticated()
                        .requestMatchers("/api/vaccine-appointments", "/api/vaccine-appointments/patient/**").hasRole("USER")
                        .requestMatchers("/api/vaccine-appointments/confirm/**").hasRole("DOCTOR")
                        .requestMatchers("/api/vaccine-appointments/availability/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/parent/**").hasRole("USER")
                        .requestMatchers("/api/doctor/**").hasRole("DOCTOR")
                        .requestMatchers("/api/doctor-availability/**").hasRole("DOCTOR")
                        .requestMatchers("/api/appointments/doctor/**").hasRole("DOCTOR")
                        .requestMatchers("/api/medical-records/**").hasRole("DOCTOR")
                        .requestMatchers("/api/feedbacks/doctor/**").hasRole("DOCTOR")
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login")
                        .successHandler(googleOAuth2SuccessHandler)
                        .failureUrl("/login?error"))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
                        })
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
>>>>>>> Stashed changes
}
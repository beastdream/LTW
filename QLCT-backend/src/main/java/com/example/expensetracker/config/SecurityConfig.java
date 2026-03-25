package com.example.expensetracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(org.springframework.security.config.Customizer.withDefaults()) // Kích hoạt CORS đã cấu hình
                .csrf(csrf -> csrf.disable()) // Tắt CSRF để React có thể thêm/sửa/xóa dữ liệu (POST, DELETE)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/user", "/error").permitAll() // Cho phép kiểm tra trạng thái login
                        .anyRequest().authenticated() // Các API khác yêu cầu phải đăng nhập
                )
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("https://tracker-ten-beryl.vercel.app", true) // QUAN TRỌNG: Đăng nhập thành công thì quay về React
                );

        return http.build();
    }
}
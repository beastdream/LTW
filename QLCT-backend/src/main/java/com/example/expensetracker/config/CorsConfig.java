package com.example.expensetracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // 1. Cho phép nhận Cookie "xuyên biên giới" (Cốt lõi để sửa lỗi Ghost Login)
        config.setAllowCredentials(true);

        // 2. Cấp thẻ VIP đúng cho cái mặt tiền Vercel của bạn
        config.setAllowedOrigins(Arrays.asList("https://tracker-ten-beryl.vercel.app"));

        // 3. Cho phép tất cả các loại dữ liệu đi qua
        config.setAllowedHeaders(Arrays.asList("*"));

        // 4. Cho phép các hành động Xem, Thêm, Sửa, Xóa
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 5. Áp dụng luật này cho mọi ngóc ngách của API
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
package com.example.expensetracker.controller;

import com.example.expensetracker.entity.User;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String phone = request.get("phoneNumber");
        String pass = request.get("password");

        Optional<User> userOpt = userRepository.findByPhoneNumber(phone);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword() != null && user.getPassword().equals(pass)) {
                // Đảm bảo trả về đầy đủ role để React điều hướng
                if (user.getRole() == null) user.setRole("USER");
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai số điện thoại hoặc mật khẩu!");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Số điện thoại này đã tồn tại!");
        }
        if (user.getRole() == null) user.setRole("USER");
        userRepository.save(user);
        return ResponseEntity.ok("Đăng ký thành công!");
    }
}
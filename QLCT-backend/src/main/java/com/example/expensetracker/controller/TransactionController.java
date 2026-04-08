package com.example.expensetracker.controller;

import com.example.expensetracker.entity.Transaction;
import com.example.expensetracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @GetMapping("/user")
    public Map<String, Object> getUserDetails(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return Map.of("error", "Not logged in");
        return principal.getAttributes();
    }

    @GetMapping("/transactions")
    public List<Transaction> getUserTransactions(@AuthenticationPrincipal OAuth2User principal,
                                                 @RequestParam(required = false) String identifier) {
        // 1. Nếu login bằng Gmail
        if (principal != null) {
            String email = principal.getAttribute("email");
            return transactionRepository.findByUserEmail(email);
        }

        // 2. Nếu login bằng SĐT: Lọc theo identifier (số điện thoại) gửi từ React
        if (identifier != null && !identifier.isEmpty()) {
            return transactionRepository.findByUserEmail(identifier);
        }

        // Nếu không có thông tin gì thì trả về danh sách trống, không dùng findAll() nữa
        return List.of();
    }

    @GetMapping("/admin/transactions")
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @PostMapping("/transactions")
    public Transaction createTransaction(@RequestBody Transaction transaction,
                                         @AuthenticationPrincipal OAuth2User principal) {
        // Ưu tiên lấy email từ Google nếu có
        if (principal != null) {
            transaction.setUserEmail(principal.getAttribute("email"));
        }
        // Nếu dùng SĐT, React sẽ tự động gửi userEmail trong body của transaction
        return transactionRepository.save(transaction);
    }
}
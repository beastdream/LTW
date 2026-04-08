package com.example.expensetracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private BigDecimal amount;
    private String category;
    private String type;
    private LocalDate date;

    @Column(name = "user_email", nullable = true) // Sửa thành true để SĐT dùng được
    private String userEmail;
}
package com.example.expensetracker.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name") // Chỉ định rõ tên cột trong DBeaver
    private String fullName;

    @Column(name = "phone_number") // Chỉ định rõ tên cột trong DBeaver
    private String phoneNumber;

    private String email;
    private String password;
    private String role;
}
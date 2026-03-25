package com.airline.controller;

import com.airline.entity.Payment;
import com.airline.entity.User;
import com.airline.repository.PaymentRepository;
import com.airline.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    PaymentRepository paymentRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping("/user")
    public List<Payment> getUserPayments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return paymentRepository.findByUser(user);
    }

    @GetMapping("/all")
    public List<Payment> getAllPayments() {
        // Simple role check could be added here, but usually handled by SecurityConfig
        return paymentRepository.findAll();
    }
}

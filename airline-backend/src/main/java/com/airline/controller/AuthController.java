package com.airline.controller;

import com.airline.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    @Autowired
    AuthService authService;

    @PostMapping("/signin")
    public Map<String, String> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        return authService.authenticateUser(loginRequest.get("email"), loginRequest.get("password"));
    }

    @PostMapping("/signup")
    public void registerUser(@RequestBody Map<String, String> signUpRequest) {
        authService.registerUser(signUpRequest.get("email"), signUpRequest.get("password"));
    }
}

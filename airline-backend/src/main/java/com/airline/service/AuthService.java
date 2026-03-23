package com.airline.service;

import com.airline.entity.RefreshToken;
import com.airline.entity.User;
import com.airline.repository.UserRepository;
import com.airline.security.JwtUtils;
import com.airline.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    private RefreshTokenService refreshTokenService; // Added injection

    public Map<String, String> loginUser(String email, String password) {
        // Check if account is blocked before attempting authentication
        User existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: Account not found."));
        if (existingUser.isBlocked()) {
            throw new RuntimeException("Error: Your account has been restricted. Please contact support.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findByEmail(email).get();
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(email);

        Map<String, String> response = new HashMap<>();
        response.put("token", jwt);
        response.put("refreshToken", refreshToken.getToken());
        response.put("email", email);
        response.put("role", userDetails.getAuthorities().iterator().next().getAuthority());
        response.put("username", user.getUsername());
        response.put("profilePictureUrl", user.getProfilePictureUrl());

        return response;
    }

    public Map<String, String> refreshToken(String requestRefreshToken) { // Added refreshToken method
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUserEmail)
                .map(email -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("Error: User not found during token refresh."));
                    if (user.isBlocked()) {
                        throw new RuntimeException("Error: Your account has been restricted. Please contact support.");
                    }

                    String token = jwtUtils.generateTokenFromUsername(email);
                    Map<String, String> response = new HashMap<>();
                    response.put("token", token);
                    response.put("refreshToken", requestRefreshToken);
                    return response;
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @Transactional
    public void registerUser(Map<String, String> signUpRequest) {
        String email = signUpRequest.get("email");
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        String username = signUpRequest.get("username");
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        User user = new User(
            null, 
            email, 
            encoder.encode(signUpRequest.get("password")), 
            "ROLE_USER",
            signUpRequest.get("firstName"),
            signUpRequest.get("lastName"),
            signUpRequest.get("otherNames"),
            signUpRequest.get("username")
        );
        
        userRepository.save(user);
    }
}

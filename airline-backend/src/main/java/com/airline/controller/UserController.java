package com.airline.controller;

import com.airline.entity.User;
import com.airline.repository.UserRepository;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    private Cloudinary cloudinary;

    @GetMapping("/me")
    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /** Admin: toggle block/unblock a user account */
    @PatchMapping("/{id}/block")
    public ResponseEntity<User> toggleBlock(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Prevent blocking admins
        if ("ROLE_ADMIN".equals(user.getRole())) {
            return ResponseEntity.badRequest().build();
        }
        user.setBlocked(!user.isBlocked());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/profile-picture")
    public User uploadProfilePicture(@RequestParam("file") MultipartFile file) throws IOException {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        String url = uploadResult.get("secure_url").toString();

        user.setProfilePictureUrl(url);
        return userRepository.save(user);
    }

    @PatchMapping("/me")
    public User updateCurrentUser(@RequestBody Map<String, String> updates) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("username") && !updates.get("username").isBlank()) {
            user.setUsername(updates.get("username"));
        }
        if (updates.containsKey("firstName") && !updates.get("firstName").isBlank()) {
            user.setFirstName(updates.get("firstName"));
        }
        if (updates.containsKey("lastName") && !updates.get("lastName").isBlank()) {
            user.setLastName(updates.get("lastName"));
        }
        if (updates.containsKey("otherNames")) {
            user.setOtherNames(updates.get("otherNames"));
        }

        return userRepository.save(user);
    }
}

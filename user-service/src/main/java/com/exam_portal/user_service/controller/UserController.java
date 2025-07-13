package com.exam_portal.user_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.examportal.common.dto.UserDTO;
import com.examportal.common.dto.LoginRequestDTO;
import com.examportal.common.exception.ResourceNotFoundException;
import com.exam_portal.user_service.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;
import com.exam_portal.user_service.model.User;


@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    // User Registration
    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@Valid @RequestBody UserDTO userDTO) {
        UserDTO registeredUser = userService.registerUser(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
    }

    // User Login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequestDTO loginRequest) {
        String token = userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword(), loginRequest.getId());
        // Fetch user by email to get the role
        User user = userService.findByEmail(loginRequest.getEmail());
        if (token != null && user != null) {
            return ResponseEntity.ok(
                Map.of(
                    "token", "Bearer " + token,
                    "role", user.getRole(), // <-- Add this line
                    "message", "Login successful"
                )
            );
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid credentials"));
        }
    }

    // View Own Profile (no admin required)
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getOwnProfile(@RequestHeader("Authorization") String tokenHeader) {
        // Remove "Bearer " prefix if present
        String token = tokenHeader.startsWith("Bearer ") ? tokenHeader.substring(7) : tokenHeader;
        // Extract email from JWT
        String email = userService.getEmailFromToken(token);
        // Fetch user from DB by email
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    // Update Own Profile
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateOwnProfile(@RequestHeader("Authorization") String tokenHeader, @RequestBody UserDTO updatedUser) {
        String token = tokenHeader.startsWith("Bearer ") ? tokenHeader.substring(7) : tokenHeader;
        UserDTO user = userService.updateUserProfile(token, updatedUser);
        return ResponseEntity.ok(user);
    }

    // Get all users (for admin)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // Get user by ID (for admin)
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // Assign role to user (for admin)
    @PutMapping("/{id}/role")
    public ResponseEntity<UserDTO> assignRole(@PathVariable Long id, @RequestParam String role) {
        UserDTO user = userService.assignRole(id, role);
        return ResponseEntity.ok(user);
    }

}


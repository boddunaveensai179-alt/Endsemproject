package com.example.library.controller;

import com.example.library.entity.User;
import com.example.library.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
@Tag(name = "Users", description = "User management endpoints (accessible by ADMIN only)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserService userService;

    // ================= GET ALL USERS =================
    @GetMapping
    @Operation(summary = "Get all registered users", description = "Accessible by ADMIN only")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // ================= GET USER BY ID =================
    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Accessible by ADMIN only")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ================= CREATE USER =================
    @PostMapping
    @Operation(summary = "Create a new user", description = "Accessible by ADMIN only")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String password = request.get("password");
        String roleStr = request.getOrDefault("role", "USER");

        if (email == null || password == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email and password are required"));
        }

        try {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(password); // will be encoded in service

            User created = userService.createUser(user, roleStr);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ================= DELETE USER =================
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user and their borrow history", description = "Accessible by ADMIN only")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User and their borrow history deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

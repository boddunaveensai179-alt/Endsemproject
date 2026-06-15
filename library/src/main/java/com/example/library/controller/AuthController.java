package com.example.library.controller;

import com.example.library.entity.Role;
import com.example.library.entity.Role.RoleName;
import com.example.library.entity.User;
import com.example.library.repository.UserRepository;
import com.example.library.security.JwtUtil;
import com.example.library.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
@Tag(name = "Authentication", description = "Register and Login endpoints")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RoleService roleService;

    // ================= REGISTER =================

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a USER account with BCrypt-hashed password")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {

        String name     = request.get("name");
        String email    = request.get("email");
        String password = request.get("password");
        String roleStr  = request.getOrDefault("role", "USER");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        if (userRepository.findByEmail(email) != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        // Determine role
        RoleName roleName = roleStr.equalsIgnoreCase("ADMIN") ? RoleName.ROLE_ADMIN : RoleName.ROLE_USER;
        Role role = roleService.getOrCreateRole(roleName);

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(roleName.name());
        user.setRoles(Set.of(role));

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully", "role", roleName.name()));
    }

    // ================= LOGIN =================

    @PostMapping("/login")
    @Operation(summary = "Login and get JWT token", description = "Accepts email or username + password, returns Bearer JWT token with user id")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

        // Accept both "email" and "usernameOrEmail" fields from frontend
        String usernameOrEmail = request.getOrDefault("usernameOrEmail",
                                   request.get("email"));
        String password = request.get("password");

        if (usernameOrEmail == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Credentials are required"));
        }

        try {
            // Spring Security will call CustomUserDetailsService.loadUserByUsername
            // which now resolves by email OR username
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(usernameOrEmail, password));

            User user = (User) authentication.getPrincipal();

            String token = jwtUtil.generateToken(user.getEmail());

            return ResponseEntity.ok(Map.of(
                "token", token,
                "type",  "Bearer",
                "id",    user.getId(),
                "email", user.getEmail(),
                "name",  user.getName() != null ? user.getName() : "",
                "role",  user.getRole() != null ? user.getRole() : ""
            ));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }
}
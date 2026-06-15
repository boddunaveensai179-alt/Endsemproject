package com.example.library.service;

import com.example.library.dto.AuthResponse;
import com.example.library.dto.LoginRequest;
import com.example.library.dto.RegisterRequest;
import com.example.library.entity.Role;
import com.example.library.entity.User;
import com.example.library.repository.UserRepository;
import com.example.library.security.JwtUtil;
import java.util.Optional;
import java.util.Set;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(
            UserRepository userRepository,
            RoleService roleService,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Role role = roleService.getOrCreateRole("USER");

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoleEntity(role);

        User savedUser = userRepository.save(user);
        return buildAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        String input = request.getUsernameOrEmail().trim();

        // Try to find by email first (if input looks like an email)
        Optional<User> userOpt = Optional.empty();

        if (input.contains("@")) {
            userOpt = userRepository.findByEmail(input.toLowerCase());
        }

        // If not found by email, try by name (username)
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByName(input);
        }

        // If still not found, try lowercase email as fallback
        if (userOpt.isEmpty() && !input.contains("@")) {
            userOpt = userRepository.findByEmail(input.toLowerCase());
        }

        User user = userOpt.orElseThrow(() -> new BadCredentialsException("Invalid username/email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username/email or password");
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        Set<String> roles = Set.of(user.getRoleEntity().getName());
        String token = jwtUtil.generateToken(user.getEmail(), roles);
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}

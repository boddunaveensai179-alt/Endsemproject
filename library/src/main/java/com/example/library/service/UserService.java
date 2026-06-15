package com.example.library.service;

import com.example.library.entity.Role;
import com.example.library.entity.Role.RoleName;
import com.example.library.entity.User;
import com.example.library.entity.Borrow;
import com.example.library.repository.UserRepository;
import com.example.library.repository.BorrowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private RoleService roleService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ================= GET ALL USERS =================
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ================= GET USER BY ID =================
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // ================= CREATE USER (ADMIN TASK) =================
    public User createUser(User user, String roleStr) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already registered");
        }

        RoleName roleName = "ADMIN".equalsIgnoreCase(roleStr) ? RoleName.ROLE_ADMIN : RoleName.ROLE_USER;
        Role role = roleService.getOrCreateRole(roleName);

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(roleName.name());
        user.setRoles(Set.of(role));

        return userRepository.save(user);
    }

    // ================= DELETE USER (TRANSACTIONAL) =================
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Delete all borrow records for this user first
        List<Borrow> borrows = borrowRepository.findByUser_Id(id);
        if (borrows != null && !borrows.isEmpty()) {
            borrowRepository.deleteAll(borrows);
        }

        // Delete user
        userRepository.delete(user);
    }
}

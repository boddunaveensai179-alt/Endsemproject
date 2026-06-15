package com.example.library.config;

import com.example.library.entity.Role;
import com.example.library.entity.Role.RoleName;
import com.example.library.entity.User;
import com.example.library.repository.UserRepository;
import com.example.library.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * DataInitializer
 * Seeds the database with required default data on startup:
 *  - Admin user: username=admin, email=admin@library.com, password=123456 (BCrypt)
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleService roleService;

    @Override
    public void run(String... args) {
        seedAdminUser();
    }

    private void seedAdminUser() {
        final String ADMIN_USERNAME = "admin";
        final String ADMIN_EMAIL    = "admin@library.com";
        final String ADMIN_PASSWORD = "123456";
        final String ADMIN_NAME     = "Administrator";

        // Get or create ADMIN role
        Role adminRole = roleService.getOrCreateRole(RoleName.ROLE_ADMIN);

        // Try to find existing admin by username or email
        User existing = userRepository.findByEmailOrUsername(ADMIN_EMAIL);
        if (existing == null) {
            existing = userRepository.findByEmailOrUsername(ADMIN_USERNAME);
        }

        if (existing == null) {
            // Create fresh admin user
            User admin = new User();
            admin.setUsernameField(ADMIN_USERNAME);
            admin.setEmail(ADMIN_EMAIL);
            admin.setName(ADMIN_NAME);
            admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
            admin.setRole(RoleName.ROLE_ADMIN.name());
            admin.setRoles(Set.of(adminRole));
            userRepository.save(admin);
            System.out.println("[DataInitializer] Admin user created: username=admin, email=admin@library.com");
        } else {
            // Fix password if it's not BCrypt encoded
            boolean needsUpdate = false;

            if (!existing.getPassword().startsWith("$2")) {
                existing.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
                needsUpdate = true;
                System.out.println("[DataInitializer] Admin password re-encoded with BCrypt");
            }
            if (existing.getUsernameField() == null) {
                existing.setUsernameField(ADMIN_USERNAME);
                needsUpdate = true;
            }
            if (!RoleName.ROLE_ADMIN.name().equals(existing.getRole())) {
                existing.setRole(RoleName.ROLE_ADMIN.name());
                existing.setRoles(Set.of(adminRole));
                needsUpdate = true;
            }
            if (needsUpdate) {
                userRepository.save(existing);
                System.out.println("[DataInitializer] Admin user updated.");
            } else {
                System.out.println("[DataInitializer] Admin user already exists and is valid.");
            }
        }
    }
}

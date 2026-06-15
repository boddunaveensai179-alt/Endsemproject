package com.example.library.service;

import com.example.library.entity.Role;
import com.example.library.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional
    public Role getOrCreateRole(String requestedRole) {
        String roleName = normalizeRole(requestedRole);
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    public String normalizeRole(String requestedRole) {
        if (requestedRole == null || requestedRole.isBlank()) {
            return "USER";
        }

        String roleName = requestedRole.trim().toUpperCase();
        if (!roleName.equals("ADMIN") && !roleName.equals("USER")) {
            return "USER";
        }

        return roleName;
    }
}

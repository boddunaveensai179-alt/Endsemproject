package com.example.library.service;

import com.example.library.entity.Role;
import com.example.library.entity.Role.RoleName;
import com.example.library.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    // ================= GET ALL ROLES =================

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    // ================= GET ROLE BY ID =================

    public Optional<Role> getRoleById(Long id) {
        return roleRepository.findById(id);
    }

    // ================= GET ROLE BY NAME =================

    public Optional<Role> getRoleByName(RoleName name) {
        return roleRepository.findByName(name);
    }

    // ================= SAVE ROLE =================

    public Role saveRole(Role role) {
        return roleRepository.save(role);
    }

    // ================= DELETE ROLE =================

    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
    }

    // ================= GET OR CREATE ROLE =================

    public Role getOrCreateRole(RoleName name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(new Role(name)));
    }
}

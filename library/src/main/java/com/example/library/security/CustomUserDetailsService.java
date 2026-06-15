package com.example.library.security;

import com.example.library.entity.User;
import com.example.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    // ================= LOAD USER BY EMAIL OR USERNAME =================

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // Try email first, then username
        User user = userRepository.findByEmailOrUsername(usernameOrEmail);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + usernameOrEmail);
        }
        return user;
    }
}

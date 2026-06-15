package com.example.library.bootstrap;

import com.example.library.entity.Book;
import com.example.library.entity.Role;
import com.example.library.entity.User;
import com.example.library.repository.BookRepository;
import com.example.library.repository.UserRepository;
import com.example.library.service.RoleService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleService roleService;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            RoleService roleService,
            UserRepository userRepository,
            BookRepository bookRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.roleService = roleService;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Role adminRole = roleService.getOrCreateRole("ADMIN");
        Role userRole  = roleService.getOrCreateRole("USER");

        // Admin: username="admin", email="admin@library.com", password="123456"
        ensureAdmin(adminRole);
        // Default user: email="user@library.com", password="123456"
        ensureUser("Library User", "user@library.com", "123456", userRole);

        if (bookRepository.count() == 0) {
            seedBook("Clean Code", "Robert C. Martin", "Programming", 650.0, 4);
            seedBook("Database System Concepts", "Abraham Silberschatz", "Database", 780.0, 3);
            seedBook("Artificial Intelligence: A Modern Approach", "Stuart Russell", "AI", 950.0, 2);
            seedBook("Computer Networks", "Andrew S. Tanenbaum", "Technology", 720.0, 5);
            seedBook("Introduction to Algorithms", "Thomas H. Cormen", "Programming", 850.0, 3);
            seedBook("The Pragmatic Programmer", "David Thomas", "Programming", 600.0, 4);
        }
    }

    /**
     * Ensure the admin account exists with:
     *   name = "admin"
     *   email = "admin@library.com"
     *   password = "123456"
     * Also fixes legacy records where name was "Library Admin".
     */
    private void ensureAdmin(Role adminRole) {
        final String adminEmail    = "admin@library.com";
        final String adminName     = "admin";
        final String adminPassword = "123456";

        userRepository.findByEmail(adminEmail).ifPresentOrElse(
            user -> {
                boolean changed = false;
                // Fix name if it's the old "Library Admin" value
                if (!adminName.equals(user.getName())) {
                    user.setName(adminName);
                    changed = true;
                }
                // Always ensure role is ADMIN
                if (user.getRoleEntity() == null
                        || !adminRole.getId().equals(user.getRoleEntity().getId())) {
                    user.setRoleEntity(adminRole);
                    changed = true;
                }
                // Update password if it doesn't match "123456"
                if (!passwordEncoder.matches(adminPassword, user.getPassword())) {
                    user.setPassword(passwordEncoder.encode(adminPassword));
                    changed = true;
                }
                if (changed) {
                    userRepository.save(user);
                }
            },
            () -> {
                User user = new User();
                user.setName(adminName);
                user.setEmail(adminEmail);
                user.setPassword(passwordEncoder.encode(adminPassword));
                user.setRoleEntity(adminRole);
                userRepository.save(user);
            }
        );
    }

    private void ensureUser(String name, String email, String password, Role role) {
        userRepository.findByEmail(email).ifPresentOrElse(
            user -> {
                // Update password if doesn't match
                if (!passwordEncoder.matches(password, user.getPassword())) {
                    user.setPassword(passwordEncoder.encode(password));
                    userRepository.save(user);
                }
            },
            () -> {
                User user = new User();
                user.setName(name);
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(password));
                user.setRoleEntity(role);
                userRepository.save(user);
            }
        );
    }

    private void seedBook(String title, String author, String category, double price, int copies) {
        Book book = new Book(title, author, category, copies);
        book.setPrice(price);
        book.setTotalCopies(copies);
        book.setAvailableCount(copies);
        bookRepository.save(book);
    }
}

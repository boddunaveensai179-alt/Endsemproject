package com.example.library.controller;

import com.example.library.dto.BorrowRequest;
import com.example.library.entity.Borrow;
import com.example.library.entity.Borrow.BorrowStatus;
import com.example.library.entity.User;
import com.example.library.repository.UserRepository;
import com.example.library.service.BorrowService;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/borrows")
public class BorrowController {

    private final BorrowService borrowService;
    private final UserRepository userRepository;

    public BorrowController(BorrowService borrowService, UserRepository userRepository) {
        this.borrowService = borrowService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Borrow>> getBorrows(Authentication authentication) {
        if (isAdmin(authentication)) {
            return ResponseEntity.ok(borrowService.getAllBorrows());
        }
        return ResponseEntity.ok(borrowService.getBorrowsByUser(currentUser(authentication).getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Borrow> getBorrowById(@PathVariable Long id, Authentication authentication) {
        Borrow borrow = borrowService.getBorrowById(id);
        assertCanAccessBorrow(borrow, authentication);
        return ResponseEntity.ok(borrow);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Borrow>> getBorrowsByUser(@PathVariable Long userId, Authentication authentication) {
        // Admin can get any user's borrows; USER can only get their own
        if (!isAdmin(authentication)) {
            User caller = currentUser(authentication);
            if (!caller.getId().equals(userId)) {
                throw new SecurityException("You can only access your own borrow records");
            }
        }
        return ResponseEntity.ok(borrowService.getBorrowsByUser(userId));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Borrow> createBorrow(
            @Valid @RequestBody BorrowRequest request,
            Authentication authentication
    ) {
        Long userId = currentUser(authentication).getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(borrowService.createBorrow(userId, request.getBookId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Borrow> updateBorrow(
            @PathVariable Long id,
            @Valid @RequestBody BorrowRequest request,
            Authentication authentication
    ) {
        Borrow existing = borrowService.getBorrowById(id);
        assertCanAccessBorrow(existing, authentication);

        if (!isAdmin(authentication)) {
            if (request.getStatus() != BorrowStatus.RETURNED) {
                throw new IllegalArgumentException("Users can only return an active borrow");
            }
            return ResponseEntity.ok(borrowService.returnBorrow(id, request.getReturnDate()));
        }

        return ResponseEntity.ok(borrowService.updateBorrow(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBorrow(@PathVariable Long id) {
        borrowService.deleteBorrow(id);
        return ResponseEntity.noContent().build();
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private void assertCanAccessBorrow(Borrow borrow, Authentication authentication) {
        if (!isAdmin(authentication) && !borrow.getUserId().equals(currentUser(authentication).getId())) {
            throw new SecurityException("You can access only your own borrow records");
        }
    }
}

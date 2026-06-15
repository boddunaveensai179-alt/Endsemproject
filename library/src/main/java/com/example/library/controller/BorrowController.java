package com.example.library.controller;

import com.example.library.entity.Borrow;
import com.example.library.entity.User;
import com.example.library.repository.UserRepository;
import com.example.library.service.BorrowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/borrows")
@CrossOrigin(origins = "*")
@Tag(name = "Borrows", description = "Borrow management endpoints (borrow and return books)")
@SecurityRequirement(name = "bearerAuth")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;

    @Autowired
    private UserRepository userRepository;

    // ======================== HELPERS ========================

    /** Resolve the currently authenticated user from the JWT. */
    private User currentUser(Authentication auth) {
        String principal = auth.getName(); // email or username stored in JWT sub
        User user = userRepository.findByEmailOrUsername(principal);
        if (user == null) {
            throw new IllegalArgumentException("Authenticated user not found: " + principal);
        }
        return user;
    }

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
    }

    // ======================== GET ALL / MY BORROWS ========================

    /**
     * ADMIN: returns every borrow record.
     * USER : returns only their own borrow records.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Get borrow records (admin = all, user = own)")
    public ResponseEntity<List<Borrow>> getBorrows(Authentication auth) {
        if (isAdmin(auth)) {
            return ResponseEntity.ok(borrowService.getAllBorrows());
        }
        User me = currentUser(auth);
        return ResponseEntity.ok(borrowService.getBorrowsByUser(me.getId()));
    }

    // ======================== GET BY ID ========================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Get borrow record by ID")
    public ResponseEntity<?> getBorrowById(@PathVariable Long id, Authentication auth) {
        return borrowService.getBorrowById(id)
                .map(b -> {
                    // Users can only see their own
                    if (!isAdmin(auth) && !b.getUser().getId().equals(currentUser(auth).getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "Access denied"));
                    }
                    return ResponseEntity.ok(b);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ======================== GET BY USER ID ========================

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Get all borrows for a specific user")
    public ResponseEntity<?> getBorrowsByUser(@PathVariable Long userId, Authentication auth) {
        // Users can only query their own records
        if (!isAdmin(auth)) {
            User me = currentUser(auth);
            if (!me.getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only view your own borrow records"));
            }
        }
        return ResponseEntity.ok(borrowService.getBorrowsByUser(userId));
    }

    // ======================== CREATE BORROW ========================

    /**
     * Users borrow a book. userId is taken from the JWT — NOT from the request body.
     * Body: { "bookId": 123 }
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Borrow a book", description = "Body: { bookId: Long }. userId is resolved from JWT token.")
    public ResponseEntity<?> createBorrow(@RequestBody Map<String, Long> request, Authentication auth) {
        Long bookId = request.get("bookId");
        if (bookId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "bookId is required"));
        }

        try {
            Long userId = currentUser(auth).getId();
            Borrow borrow = borrowService.createBorrow(userId, bookId);
            return ResponseEntity.status(HttpStatus.CREATED).body(borrow);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================== UPDATE BORROW ========================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Update a borrow record (admin) or return a book (user)")
    public ResponseEntity<?> updateBorrow(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            Authentication auth
    ) {
        try {
            Borrow existing = borrowService.getBorrowById(id)
                    .orElseThrow(() -> new RuntimeException("Borrow not found"));

            // Users can only return their own books
            if (!isAdmin(auth)) {
                User me = currentUser(auth);
                if (!existing.getUser().getId().equals(me.getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "You can only return your own borrowed books"));
                }
                // Return the book
                return ResponseEntity.ok(borrowService.returnBook(id));
            }

            // Admin full update
            Borrow updated = borrowService.adminUpdateBorrow(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================== RETURN BOOK (convenience) ========================

    @PutMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Return a borrowed book")
    public ResponseEntity<?> returnBook(@PathVariable Long id, Authentication auth) {
        try {
            Borrow existing = borrowService.getBorrowById(id)
                    .orElseThrow(() -> new RuntimeException("Borrow not found"));
            if (!isAdmin(auth)) {
                User me = currentUser(auth);
                if (!existing.getUser().getId().equals(me.getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "You can only return your own books"));
                }
            }
            return ResponseEntity.ok(borrowService.returnBook(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================== DELETE BORROW ========================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a borrow record (ADMIN only)")
    public ResponseEntity<String> deleteBorrow(@PathVariable Long id) {
        try {
            borrowService.deleteBorrow(id);
            return ResponseEntity.ok("Borrow record deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

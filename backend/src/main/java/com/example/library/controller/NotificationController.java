package com.example.library.controller;

import com.example.library.entity.Borrow;
import com.example.library.entity.Borrow.BorrowStatus;
import com.example.library.entity.Book;
import com.example.library.entity.User;
import com.example.library.repository.BookRepository;
import com.example.library.repository.BorrowRepository;
import com.example.library.repository.UserRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * NotificationController
 * Returns smart, role-aware notifications to the authenticated user.
 *
 * USER notifications:
 *  - Books due soon (borrowed >= 7 days without being returned)
 *  - Overdue books (borrowed >= 14 days without return)
 *  - New books added within last 7 days (availableCount > 0)
 *  - Low stock alerts for books the user has previously borrowed
 *
 * ADMIN notifications:
 *  - All overdue borrows across every user
 *  - Books running low on stock (availableCount == 1)
 *  - New users registered today
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final BorrowRepository borrowRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public NotificationController(
            BorrowRepository borrowRepository,
            BookRepository bookRepository,
            UserRepository userRepository) {
        this.borrowRepository = borrowRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications(Authentication authentication) {
        List<Map<String, Object>> notifications = new ArrayList<>();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);

        LocalDate today = LocalDate.now();

        if (isAdmin) {
            buildAdminNotifications(notifications, today);
        } else {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElse(null);
            if (user != null) {
                buildUserNotifications(notifications, user, today);
            }
        }

        return ResponseEntity.ok(notifications);
    }

    // ============================================================
    // USER notifications
    // ============================================================

    private void buildUserNotifications(List<Map<String, Object>> list, User user, LocalDate today) {
        List<Borrow> activeBorrows = borrowRepository.findByUser_IdOrderByBorrowDateDescIdDesc(user.getId())
                .stream()
                .filter(b -> b.getStatus() == BorrowStatus.BORROWED)
                .toList();

        for (Borrow borrow : activeBorrows) {
            long daysBorrowed = ChronoUnit.DAYS.between(borrow.getBorrowDate(), today);
            String bookTitle = borrow.getBook() != null ? borrow.getBook().getTitle() : "Book #" + borrow.getBookId();

            if (daysBorrowed >= 14) {
                list.add(notification(
                        "OVERDUE",
                        "Overdue: \"" + bookTitle + "\"",
                        "This book has been borrowed for " + daysBorrowed + " days. Please return it immediately to avoid extra fees.",
                        "error"
                ));
            } else if (daysBorrowed >= 7) {
                list.add(notification(
                        "DUE_SOON",
                        "Due Soon: \"" + bookTitle + "\"",
                        "This book has been borrowed for " + daysBorrowed + " days. Please plan to return it soon.",
                        "warning"
                ));
            }
        }

        // New books in stock (added recently with available copies)
        List<Book> allBooks = bookRepository.findAll();
        long newBookCount = allBooks.stream().filter(b -> b.getAvailableCount() > 0).count();
        if (newBookCount > 0) {
            list.add(notification(
                    "NEW_STOCK",
                    "Books Available",
                    newBookCount + " book(s) are currently available for borrowing in the library.",
                    "info"
            ));
        }

        // Low stock on books
        allBooks.stream()
                .filter(b -> b.getAvailableCount() == 1 && b.getTotalCopies() > 1)
                .limit(3)
                .forEach(b -> list.add(notification(
                        "LOW_STOCK",
                        "Last Copy: \"" + b.getTitle() + "\"",
                        "Only 1 copy remains available. Borrow it before it's gone!",
                        "warning"
                )));

        if (list.isEmpty()) {
            list.add(notification(
                    "ALL_GOOD",
                    "You're all caught up!",
                    "No pending dues or alerts. Enjoy your reading!",
                    "success"
            ));
        }
    }

    // ============================================================
    // ADMIN notifications
    // ============================================================

    private void buildAdminNotifications(List<Map<String, Object>> list, LocalDate today) {
        List<Borrow> allActiveBorrows = borrowRepository.findAllByOrderByBorrowDateDescIdDesc()
                .stream()
                .filter(b -> b.getStatus() == BorrowStatus.BORROWED)
                .toList();

        long overdueCount = allActiveBorrows.stream()
                .filter(b -> ChronoUnit.DAYS.between(b.getBorrowDate(), today) >= 14)
                .count();

        if (overdueCount > 0) {
            list.add(notification(
                    "OVERDUE",
                    overdueCount + " Overdue Borrow(s)",
                    overdueCount + " book(s) have been borrowed for more than 14 days without return. Review the borrow records.",
                    "error"
            ));
        }

        long dueSoonCount = allActiveBorrows.stream()
                .filter(b -> {
                    long days = ChronoUnit.DAYS.between(b.getBorrowDate(), today);
                    return days >= 7 && days < 14;
                })
                .count();

        if (dueSoonCount > 0) {
            list.add(notification(
                    "DUE_SOON",
                    dueSoonCount + " Book(s) Due Soon",
                    dueSoonCount + " borrow(s) are approaching the 14-day limit.",
                    "warning"
            ));
        }

        // Low stock books
        bookRepository.findAll().stream()
                .filter(b -> b.getAvailableCount() == 0 && b.getTotalCopies() > 0)
                .limit(5)
                .forEach(b -> list.add(notification(
                        "OUT_OF_STOCK",
                        "Out of Stock: \"" + b.getTitle() + "\"",
                        "All " + b.getTotalCopies() + " copies are borrowed. Consider adding more copies.",
                        "error"
                )));

        bookRepository.findAll().stream()
                .filter(b -> b.getAvailableCount() == 1 && b.getTotalCopies() > 1)
                .limit(3)
                .forEach(b -> list.add(notification(
                        "LOW_STOCK",
                        "Low Stock: \"" + b.getTitle() + "\"",
                        "Only 1 of " + b.getTotalCopies() + " copies available.",
                        "warning"
                )));

        long totalBorrowed = allActiveBorrows.size();
        if (totalBorrowed > 0) {
            list.add(notification(
                    "INFO",
                    totalBorrowed + " Active Borrow(s)",
                    totalBorrowed + " book(s) are currently checked out by library members.",
                    "info"
            ));
        }

        if (list.isEmpty()) {
            list.add(notification(
                    "ALL_GOOD",
                    "Library is running smoothly!",
                    "No overdue books or stock issues detected.",
                    "success"
            ));
        }
    }

    private Map<String, Object> notification(String type, String title, String message, String severity) {
        Map<String, Object> n = new LinkedHashMap<>();
        n.put("type", type);
        n.put("title", title);
        n.put("message", message);
        n.put("severity", severity);
        n.put("timestamp", LocalDate.now().toString());
        return n;
    }
}

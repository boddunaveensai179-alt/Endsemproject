package com.example.library.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * NotificationController
 * Returns system-level library notifications (book availability alerts, etc.)
 */
@RestController
@RequestMapping("/notifications")
@CrossOrigin("*")
@Tag(name = "Notifications", description = "System notification endpoints")
public class NotificationController {

    @GetMapping
    @Operation(summary = "Get system notifications", description = "Returns library system alerts and notifications")
    public ResponseEntity<List<Map<String, String>>> getNotifications() {
        List<Map<String, String>> notifications = new ArrayList<>();

        notifications.add(Map.of(
            "title",    "Welcome to Digital Library",
            "message",  "Browse and borrow books from our growing collection.",
            "severity", "info"
        ));
        notifications.add(Map.of(
            "title",    "Borrow Limit",
            "message",  "Each user can borrow up to 5 books at a time.",
            "severity", "warning"
        ));
        notifications.add(Map.of(
            "title",    "Return Policy",
            "message",  "Please return books within 14 days of borrowing.",
            "severity", "info"
        ));

        return ResponseEntity.ok(notifications);
    }
}

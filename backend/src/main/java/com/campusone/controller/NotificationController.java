package com.campusone.controller;

import com.campusone.model.Notification;
import com.campusone.model.Role;
import com.campusone.dto.NotificationRequest;
import com.campusone.dto.UserNotificationResponse;
import com.campusone.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{role}")
    public ResponseEntity<List<Notification>> byRole(@PathVariable String role) {
        Role parsed = Role.valueOf(role.toUpperCase());
        return ResponseEntity.ok(notificationService.getByRole(parsed));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserNotificationResponse>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotificationResponses(userId));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/user/{userId}/{userNotificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long userId, @PathVariable Long userNotificationId) {
        notificationService.markAsRead(userNotificationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Notification> create(@RequestBody NotificationRequest request) {
        return ResponseEntity.ok(notificationService.createNotification(request));
    }
}


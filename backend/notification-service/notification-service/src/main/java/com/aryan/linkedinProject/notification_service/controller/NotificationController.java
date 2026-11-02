package com.aryan.linkedinProject.notification_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aryan.linkedinProject.notification_service.dto.NotificationDto;
import com.aryan.linkedinProject.notification_service.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/core")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markRead(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long notificationId) {
        notificationService.markRead(userId, notificationId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@RequestHeader("X-User-Id") Long userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.noContent().build();
    }
}

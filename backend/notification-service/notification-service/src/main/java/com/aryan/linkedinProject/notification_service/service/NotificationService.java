package com.aryan.linkedinProject.notification_service.service;

import org.springframework.stereotype.Service;

import com.aryan.linkedinProject.notification_service.entity.Notification;
import com.aryan.linkedinProject.notification_service.repository.NotificationRepository;
import com.aryan.linkedinProject.notification_service.exception.ResourceNotFoundException;
import com.aryan.linkedinProject.notification_service.dto.NotificationDto;
import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service 
@Slf4j
@RequiredArgsConstructor 
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void addNotification(Notification notification){
        log.info("Adding notification to db, message: {}", notification.getMessage());
        notification = notificationRepository.save(notification);
    }

    public List<NotificationDto> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(notification -> new NotificationDto(
                        notification.getId(),
                        notification.getMessage(),
                        notification.getType(),
                        notification.getActorUserId(),
                        notification.getPostId(),
                        notification.getCreatedAt(),
                        notification.isRead()))
                .toList();
    }

    public void markRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!userId.equals(notification.getUserId())) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(notification -> !notification.isRead())
                .toList();
        unread.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unread);
    }

}

package com.aryan.linkedinProject.notification_service.service;

import org.springframework.stereotype.Service;

import com.aryan.linkedinProject.notification_service.entity.Notification;
import com.aryan.linkedinProject.notification_service.repository.NotificationRepository;

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

}

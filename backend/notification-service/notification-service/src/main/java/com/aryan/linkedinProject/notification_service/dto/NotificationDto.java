package com.aryan.linkedinProject.notification_service.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NotificationDto {

    private Long id;
    private String message;
    private String type;
    private Long actorUserId;
    private Long postId;
    private LocalDateTime createdAt;
    private boolean read;
}

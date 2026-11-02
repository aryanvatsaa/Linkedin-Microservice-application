package com.aryan.linkedinProject.notification_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.aryan.linkedinProject.notification_service.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

}

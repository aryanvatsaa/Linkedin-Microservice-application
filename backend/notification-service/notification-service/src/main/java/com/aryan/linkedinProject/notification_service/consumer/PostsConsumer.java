package com.aryan.linkedinProject.notification_service.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.aryan.linkedinProject.notification_service.entity.Notification;
import com.aryan.linkedinProject.notification_service.service.NotificationService;
import com.aryan.linkedinProject.connectionService.event.ConnectionEvent;
import com.aryan.linkedinProject.postsService.event.PostCreated;
import com.aryan.linkedinProject.postsService.event.PostLiked;
import com.aryan.linkedinProject.postsService.event.PostCommentCreated;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service 
@Slf4j 
@RequiredArgsConstructor
public class PostsConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "post_created_topic")
    public void handlePostCreated(PostCreated postCreated){
        log.info("handlePostCreated: {}", postCreated);

        String message = postCreated.getContent() == null || postCreated.getContent().isBlank()
                ? "shared a new post"
                : "shared a post: " + postCreated.getContent();
        Notification notification = Notification.builder()
                .message(message)
                .userId(postCreated.getUserId())
                .type("post")
                .actorUserId(postCreated.getOwnerUserId())
                .postId(postCreated.getPostId())
                .build();
        notificationService.addNotification(notification);

    }

    @KafkaListener(topics = "post_liked_topic")
    public void handlePostLiked(PostLiked postLiked){
        log.info("handlePostLikes: {}", postLiked);

        Notification notification = Notification.builder()
                .message("appreciated your post")
                .userId(postLiked.getOwnerUserId())
                .type("like")
                .actorUserId(postLiked.getLikedByUserId())
                .postId(postLiked.getPostId())
                .build();
        notificationService.addNotification(notification);
    }

    @KafkaListener(topics = "post_comment_created_topic")
    public void handlePostCommentCreated(PostCommentCreated event) {
        log.info("handlePostCommentCreated: {}", event);

        Notification notification = Notification.builder()
                .message("commented on your post")
                .userId(event.getPostOwnerId())
                .type("comment")
                .actorUserId(event.getCommenterUserId())
                .postId(event.getPostId())
                .build();
        notificationService.addNotification(notification);
    }

    @KafkaListener(topics = "connection_events_topic")
    public void handleConnectionEvent(ConnectionEvent event) {
        String message = event.getType().equals("connection_request")
                ? "sent you a connection request"
                : "accepted your connection request";
        notificationService.addNotification(Notification.builder()
                .message(message)
                .userId(event.getRecipientUserId())
                .actorUserId(event.getActorUserId())
                .type(event.getType())
                .build());
    }

}

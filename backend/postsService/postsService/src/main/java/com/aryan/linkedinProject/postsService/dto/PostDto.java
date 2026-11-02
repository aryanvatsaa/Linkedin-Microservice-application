package com.aryan.linkedinProject.postsService.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data 
public class PostDto {
    private Long id;
    private String content;
    private Long userId;
    private LocalDateTime createdAt;
    private String imageUrl;
    private String authorName;
    private String authorHeadline;
    private long likes;
    private boolean liked;
    private boolean saved;
    private long comments;
    private List<PostCommentDto> commentItems;
}

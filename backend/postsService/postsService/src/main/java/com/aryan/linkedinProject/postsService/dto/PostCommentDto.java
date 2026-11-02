package com.aryan.linkedinProject.postsService.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PostCommentDto {

    private Long id;
    private Long userId;
    private String content;
    private LocalDateTime createdAt;
}

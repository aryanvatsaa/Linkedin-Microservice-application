package com.aryan.linkedinProject.postsService.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostCommentCreated {

    private Long postId;
    private Long commenterUserId;
    private Long postOwnerId;
    private String content;
}

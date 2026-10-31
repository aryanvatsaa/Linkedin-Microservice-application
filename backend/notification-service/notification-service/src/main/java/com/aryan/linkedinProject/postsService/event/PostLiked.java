package com.aryan.linkedinProject.postsService.event;

import lombok.Data;

@Data 
public class PostLiked {
    private Long ownerUserId;
    private Long postId;
    private Long likedByUserId;

}

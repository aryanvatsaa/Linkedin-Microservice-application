package com.aryan.linkedinProject.postsService.event;

import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class PostLiked {
    private Long ownerUserId;
    private Long postId;
    private Long likedByUserId;

}

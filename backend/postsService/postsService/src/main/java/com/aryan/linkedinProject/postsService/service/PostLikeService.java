package com.aryan.linkedinProject.postsService.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aryan.linkedinProject.postsService.auth.AuthContextHolder;
import com.aryan.linkedinProject.postsService.entity.Post;
import com.aryan.linkedinProject.postsService.entity.PostLike;
import com.aryan.linkedinProject.postsService.event.PostLiked;
import com.aryan.linkedinProject.postsService.exception.BadRequestException;
import com.aryan.linkedinProject.postsService.exception.ResourceNotFoundException;
import com.aryan.linkedinProject.postsService.repository.PostLikeRepository;
import com.aryan.linkedinProject.postsService.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service 
@RequiredArgsConstructor 
@Slf4j 
public class PostLikeService {
    
    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final KafkaTemplate<Long, PostLiked> postLikedKafkaTemplate;

    @Transactional 
    public void likePost(Long postId) {
        Long userId = AuthContextHolder.getCurrentUserId();
        log.info("User with ID: {} liking the post with ID: {}", userId, postId);

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: "+postId));
        
        boolean hasAlreadyLiked = postLikeRepository.existsByUserIdAndPostId(userId, postId);
        if(hasAlreadyLiked) throw new BadRequestException("you Cannot like the post again!!");

        PostLike postLike = new PostLike();
        postLike.setPostId(postId);
        postLike.setUserId(userId);
        postLikeRepository.save(postLike);

        // TODO: SEND NOTIFICATION TO THE OWNER OF THE POST
        PostLiked postLiked = PostLiked.builder()
            .postId(postId)
            .likedByUserId(userId)
            .ownerUserId(post.getUserId())
            .build();
        postLikedKafkaTemplate.send("post_liked_topic", postLiked);

    }

    @Transactional
    public void unlikePost(Long postId) {
        Long userId = AuthContextHolder.getCurrentUserId();

        log.info("User with ID: {} unliking the post with ID: {}", userId, postId);

        postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: "+postId));
        
        boolean hasAlreadyLiked = postLikeRepository.existsByUserIdAndPostId(userId, postId);
        if(!hasAlreadyLiked) throw new BadRequestException("you Cannot unlike the post that you have not liked!!");

        postLikeRepository.deleteByUserIdAndPostId(userId, postId);
    }

}

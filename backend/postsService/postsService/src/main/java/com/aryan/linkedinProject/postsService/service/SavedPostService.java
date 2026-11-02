package com.aryan.linkedinProject.postsService.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aryan.linkedinProject.postsService.auth.AuthContextHolder;
import com.aryan.linkedinProject.postsService.entity.SavedPost;
import com.aryan.linkedinProject.postsService.exception.BadRequestException;
import com.aryan.linkedinProject.postsService.exception.ResourceNotFoundException;
import com.aryan.linkedinProject.postsService.repository.PostRepository;
import com.aryan.linkedinProject.postsService.repository.SavedPostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SavedPostService {

    private final PostRepository postRepository;
    private final SavedPostRepository savedPostRepository;

    @Transactional
    public void save(Long postId) {
        Long userId = currentUserId();
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with ID: " + postId);
        }
        if (!savedPostRepository.existsByUserIdAndPostId(userId, postId)) {
            SavedPost savedPost = new SavedPost();
            savedPost.setUserId(userId);
            savedPost.setPostId(postId);
            savedPostRepository.save(savedPost);
        }
    }

    @Transactional
    public void remove(Long postId) {
        Long userId = currentUserId();
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with ID: " + postId);
        }
        savedPostRepository.deleteByUserIdAndPostId(userId, postId);
    }

    private Long currentUserId() {
        Long userId = AuthContextHolder.getCurrentUserId();
        if (userId == null) {
            throw new BadRequestException("Authentication is required");
        }
        return userId;
    }
}

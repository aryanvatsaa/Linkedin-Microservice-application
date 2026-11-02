package com.aryan.linkedinProject.postsService.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aryan.linkedinProject.postsService.entity.SavedPost;

public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {

    boolean existsByUserIdAndPostId(Long userId, Long postId);

    List<SavedPost> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByUserIdAndPostId(Long userId, Long postId);
}

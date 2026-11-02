package com.aryan.linkedinProject.postsService.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aryan.linkedinProject.postsService.entity.PostComment;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    List<PostComment> findByPostIdOrderByCreatedAtAsc(Long postId);
}

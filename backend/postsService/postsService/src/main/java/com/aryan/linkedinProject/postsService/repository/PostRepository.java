package com.aryan.linkedinProject.postsService.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.aryan.linkedinProject.postsService.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByUserId(Long userId);

    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Post> findByUserIdInOrderByCreatedAtDesc(List<Long> userIds);

    List<Post> findAllByOrderByCreatedAtDesc();

    Page<Post> findAll(Pageable pageable);

    Page<Post> findByUserIdIn(List<Long> userIds, Pageable pageable);

}

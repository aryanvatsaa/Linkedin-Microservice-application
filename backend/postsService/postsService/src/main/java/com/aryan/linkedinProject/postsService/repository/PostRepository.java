package com.aryan.linkedinProject.postsService.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aryan.linkedinProject.postsService.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByUserId(Long userId);

}

package com.aryan.linkedinProject.postsService.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aryan.linkedinProject.postsService.entity.PostLike;

public interface PostLikeRepository extends JpaRepository<PostLike, Long>{

    boolean existsByUserIdAndPostId(Long userId, Long postId);

	void deleteByUserIdAndPostId(Long userId, Long postId);

}

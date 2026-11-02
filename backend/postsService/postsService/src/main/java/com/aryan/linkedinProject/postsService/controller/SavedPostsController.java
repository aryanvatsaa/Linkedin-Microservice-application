package com.aryan.linkedinProject.postsService.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aryan.linkedinProject.postsService.dto.PostDto;
import com.aryan.linkedinProject.postsService.service.PostService;
import com.aryan.linkedinProject.postsService.service.SavedPostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/saved")
@RequiredArgsConstructor
public class SavedPostsController {

    private final PostService postService;
    private final SavedPostService savedPostService;

    @GetMapping
    public ResponseEntity<List<PostDto>> getSavedPosts() {
        return ResponseEntity.ok(postService.getSavedPosts());
    }

    @PostMapping("/{postId}")
    public ResponseEntity<Void> savePost(@PathVariable Long postId) {
        savedPostService.save(postId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> removeSavedPost(@PathVariable Long postId) {
        savedPostService.remove(postId);
        return ResponseEntity.noContent().build();
    }
}

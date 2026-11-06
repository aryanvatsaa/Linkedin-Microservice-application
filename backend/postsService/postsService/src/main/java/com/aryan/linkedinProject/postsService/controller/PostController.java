package com.aryan.linkedinProject.postsService.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.aryan.linkedinProject.postsService.dto.PostCreateRequestDto;
import com.aryan.linkedinProject.postsService.dto.PostDto;
import com.aryan.linkedinProject.postsService.dto.PostFeedPageDto;
import com.aryan.linkedinProject.postsService.dto.PostUpdateRequestDto;
import com.aryan.linkedinProject.postsService.service.PostService;

import org.springframework.http.MediaType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor 
@RequestMapping("/core")
public class PostController {

    private final PostService postService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDto> createPost(
            @Valid @RequestPart("post") PostCreateRequestDto postCreateRequestDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        PostDto postDto = postService.createPost(postCreateRequestDto, file);
        return new ResponseEntity<>(postDto, HttpStatus.CREATED);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostDto> getPost(@PathVariable Long postId){
        PostDto postDto = postService.getPostById(postId);
        return ResponseEntity.ok(postDto);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody PostUpdateRequestDto request) {
        return ResponseEntity.ok(postService.updatePost(postId, request));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostDto>> getFeed(
            @RequestParam(defaultValue = "for-you") String scope) {
        return ResponseEntity.ok(postService.getFeed(scope));
    }

    @GetMapping("/feed/page")
    public ResponseEntity<PostFeedPageDto> getFeedPage(
            @RequestParam(defaultValue = "for-you") String scope,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getFeedPage(scope, page, size));
    }

    @GetMapping("/users/{userId}/allPosts")
    public ResponseEntity<List<PostDto>> getAllPostsOfUser(@PathVariable Long userId){
        List<PostDto> posts = postService.getAllPostsOfUser(userId);
        return ResponseEntity.ok(posts);
    }


}

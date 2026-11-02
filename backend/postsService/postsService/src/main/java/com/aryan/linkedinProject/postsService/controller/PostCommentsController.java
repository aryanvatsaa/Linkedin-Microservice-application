package com.aryan.linkedinProject.postsService.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aryan.linkedinProject.postsService.dto.CommentCreateRequestDto;
import com.aryan.linkedinProject.postsService.dto.PostCommentDto;
import com.aryan.linkedinProject.postsService.service.PostCommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class PostCommentsController {

    private final PostCommentService postCommentService;

    @GetMapping("/{postId}")
    public ResponseEntity<List<PostCommentDto>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(postCommentService.getComments(postId));
    }

    @PostMapping("/{postId}")
    public ResponseEntity<PostCommentDto> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentCreateRequestDto request) {
        return new ResponseEntity<>(postCommentService.addComment(postId, request), HttpStatus.CREATED);
    }
}

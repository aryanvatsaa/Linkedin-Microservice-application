package com.aryan.linkedinProject.postsService.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aryan.linkedinProject.postsService.auth.AuthContextHolder;
import com.aryan.linkedinProject.postsService.dto.CommentCreateRequestDto;
import com.aryan.linkedinProject.postsService.dto.PostCommentDto;
import com.aryan.linkedinProject.postsService.entity.Post;
import com.aryan.linkedinProject.postsService.entity.PostComment;
import com.aryan.linkedinProject.postsService.event.PostCommentCreated;
import com.aryan.linkedinProject.postsService.exception.BadRequestException;
import com.aryan.linkedinProject.postsService.exception.ResourceNotFoundException;
import com.aryan.linkedinProject.postsService.repository.PostCommentRepository;
import com.aryan.linkedinProject.postsService.repository.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostCommentService {

    private final PostRepository postRepository;
    private final PostCommentRepository postCommentRepository;
    private final ModelMapper modelMapper;
    private final KafkaTemplate<Long, PostCommentCreated> postCommentKafkaTemplate;

    @Transactional(readOnly = true)
    public List<PostCommentDto> getComments(Long postId) {
        requirePost(postId);
        return postCommentRepository.findByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(comment -> modelMapper.map(comment, PostCommentDto.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public PostCommentDto addComment(Long postId, CommentCreateRequestDto request) {
        Long userId = AuthContextHolder.getCurrentUserId();
        if (userId == null) {
            throw new BadRequestException("Authentication is required");
        }
        Post post = requirePost(postId);
        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (content.isEmpty()) {
            throw new BadRequestException("A comment cannot be empty");
        }

        PostComment comment = new PostComment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setContent(content);
        comment = postCommentRepository.save(comment);

        if (!userId.equals(post.getUserId())) {
            postCommentKafkaTemplate.send("post_comment_created_topic", PostCommentCreated.builder()
                    .postId(postId)
                    .commenterUserId(userId)
                    .postOwnerId(post.getUserId())
                    .content(content)
                    .build());
        }
        return modelMapper.map(comment, PostCommentDto.class);
    }

    private Post requirePost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: " + postId));
    }
}

package com.aryan.linkedinProject.postsService.service;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.aryan.linkedinProject.postsService.auth.AuthContextHolder;
import com.aryan.linkedinProject.postsService.client.ConnectionsServiceClient;
import com.aryan.linkedinProject.postsService.client.UploaderServiceClient;
import com.aryan.linkedinProject.postsService.dto.PersonDto;
import com.aryan.linkedinProject.postsService.dto.PostCreateRequestDto;
import com.aryan.linkedinProject.postsService.dto.PostDto;
import com.aryan.linkedinProject.postsService.dto.PostFeedPageDto;
import com.aryan.linkedinProject.postsService.dto.PostUpdateRequestDto;
import com.aryan.linkedinProject.postsService.dto.PostCommentDto;
import com.aryan.linkedinProject.postsService.entity.Post;
import com.aryan.linkedinProject.postsService.entity.SavedPost;
import com.aryan.linkedinProject.postsService.event.PostCreated;
import com.aryan.linkedinProject.postsService.exception.ResourceNotFoundException;
import com.aryan.linkedinProject.postsService.exception.BadRequestException;
import com.aryan.linkedinProject.postsService.repository.PostRepository;
import com.aryan.linkedinProject.postsService.repository.PostLikeRepository;
import com.aryan.linkedinProject.postsService.repository.PostCommentRepository;
import com.aryan.linkedinProject.postsService.repository.SavedPostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service 
@RequiredArgsConstructor 
@Slf4j 
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostCommentRepository postCommentRepository;
    private final SavedPostRepository savedPostRepository;
    private final ModelMapper modelMapper;
    private final ConnectionsServiceClient connectionsServiceClient;
    private final KafkaTemplate<Long, PostCreated> postCreatedKafkaTemplate;
    private final UploaderServiceClient uploaderServiceClient;

    public PostDto createPost(PostCreateRequestDto postCreateRequestDto, MultipartFile file) {
        Long userId = AuthContextHolder.getCurrentUserId();
        log.info("creating post for user with id: {}", userId);

        String content = postCreateRequestDto.getContent() == null
                ? ""
                : postCreateRequestDto.getContent().trim();
        if (content.isEmpty() && (file == null || file.isEmpty())) {
            throw new BadRequestException("A post must include text or an image");
        }

        List<PersonDto> personDtoList = connectionsServiceClient.getFirstDegreeConnections(userId);
        if (personDtoList == null) {
            throw new IllegalStateException("Connections service returned no response");
        }
        Post post = modelMapper.map(postCreateRequestDto, Post.class);
        post.setContent(content);
        post.setUserId(userId);
        if (file != null && !file.isEmpty()) {
            ResponseEntity<String> imageUrl = uploaderServiceClient.uploadFile(file);
            if (imageUrl.getBody() == null || imageUrl.getBody().isBlank()) {
                throw new IllegalStateException("Uploader service returned an empty image URL");
            }
            post.setImageUrl(imageUrl.getBody());
        }
        post = postRepository.save(post);

        for(PersonDto person: personDtoList){               // SENDING NOTIFICATIONS TO EACH CONNECTION WHEN POST IS CREATED
            PostCreated postCreated = PostCreated.builder()
                .postId(post.getId())
                .content(post.getContent())
                .userId(person.getUserId())
                .ownerUserId(userId)
                .build();
            postCreatedKafkaTemplate.send("post_created_topic", postCreated);
        }

        return toDto(post);
    }

    public PostDto getPostById(Long postId) {


        Post post = postRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: "+postId));
        return toDto(post);
    }

    @Transactional
    public PostDto updatePost(Long postId, PostUpdateRequestDto request) {
        Long currentUserId = AuthContextHolder.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("Authentication is required");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        if (!currentUserId.equals(post.getUserId())) {
            throw new ResourceNotFoundException("Post not found");
        }

        String content = request.getContent().trim();
        if (content.isEmpty()) {
            throw new BadRequestException("A post cannot be empty");
        }
        post.setContent(content);
        return toDto(postRepository.save(post));
    }

    @Transactional
    public void deletePost(Long postId) {
        Long currentUserId = AuthContextHolder.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("Authentication is required");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        if (!currentUserId.equals(post.getUserId())) {
            throw new ResourceNotFoundException("Post not found");
        }

        postCommentRepository.deleteByPostId(postId);
        postLikeRepository.deleteByPostId(postId);
        savedPostRepository.deleteByPostId(postId);
        postRepository.delete(post);
    }

    public List<PostDto> getAllPostsOfUser(Long userId) {
        List<Post> postList = postRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return postList
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public List<PostDto> getFeed(String scope) {
        if ("for-you".equals(scope)) {
            return postRepository.findAllByOrderByCreatedAtDesc()
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }
        if (!"connections".equals(scope)) {
            throw new BadRequestException("Feed scope must be for-you or connections");
        }
        Long currentUserId = AuthContextHolder.getCurrentUserId();
        List<PersonDto> connections = connectionsServiceClient.getFirstDegreeConnections(currentUserId);
        if (connections == null) {
            throw new IllegalStateException("Connections service returned no response");
        }
        Set<Long> userIds = new HashSet<>();
        userIds.add(currentUserId);
        Map<Long, String> authorNames = new HashMap<>();
        Map<Long, String> authorHeadlines = new HashMap<>();
        for (PersonDto person : connections) {
            if (person.getUserId() == null) {
                continue;
            }
            userIds.add(person.getUserId());
            if (person.getName() != null && !person.getName().isBlank()) {
                authorNames.putIfAbsent(person.getUserId(), person.getName());
            }
            if (person.getHeadline() != null && !person.getHeadline().isBlank()) {
                authorHeadlines.putIfAbsent(person.getUserId(), person.getHeadline());
            }
        }

        return postRepository.findByUserIdInOrderByCreatedAtDesc(new ArrayList<>(userIds))
                .stream()
                .map(post -> toDto(post, authorNames, authorHeadlines))
                .collect(Collectors.toList());
    }

    public PostFeedPageDto getFeedPage(String scope, int page, int size) {
        if (page < 0 || size < 1 || size > 50) {
            throw new BadRequestException("Feed page must be non-negative and size must be between 1 and 50");
        }
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
        Page<Post> posts;
        if ("for-you".equals(scope)) {
            posts = postRepository.findAll(pageable);
            return toFeedPage(posts, Map.of(), Map.of());
        }
        if (!"connections".equals(scope)) {
            throw new BadRequestException("Feed scope must be for-you or connections");
        }

        Long currentUserId = AuthContextHolder.getCurrentUserId();
        List<PersonDto> connections = connectionsServiceClient.getFirstDegreeConnections(currentUserId);
        if (connections == null) {
            throw new IllegalStateException("Connections service returned no response");
        }
        Set<Long> userIds = new HashSet<>();
        userIds.add(currentUserId);
        Map<Long, String> authorNames = new HashMap<>();
        Map<Long, String> authorHeadlines = new HashMap<>();
        for (PersonDto person : connections) {
            if (person.getUserId() == null) {
                continue;
            }
            userIds.add(person.getUserId());
            if (person.getName() != null && !person.getName().isBlank()) {
                authorNames.putIfAbsent(person.getUserId(), person.getName());
            }
            if (person.getHeadline() != null && !person.getHeadline().isBlank()) {
                authorHeadlines.putIfAbsent(person.getUserId(), person.getHeadline());
            }
        }
        posts = postRepository.findByUserIdIn(new ArrayList<>(userIds), pageable);
        return toFeedPage(posts, authorNames, authorHeadlines);
    }

    private PostFeedPageDto toFeedPage(Page<Post> posts, Map<Long, String> authorNames,
            Map<Long, String> authorHeadlines) {
        return new PostFeedPageDto(
                posts.getContent().stream()
                        .map(post -> toDto(post, authorNames, authorHeadlines))
                        .collect(Collectors.toList()),
                posts.getNumber(),
                posts.getSize(),
                posts.hasNext());
    }

    public List<PostDto> getSavedPosts() {
        Long currentUserId = AuthContextHolder.getCurrentUserId();
        List<SavedPost> savedPosts = savedPostRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);
        List<Long> postIds = savedPosts.stream().map(SavedPost::getPostId).collect(Collectors.toList());
        Map<Long, Post> postsById = new HashMap<>();
        for (Post post : postRepository.findAllById(postIds)) {
            postsById.put(post.getId(), post);
        }
        return postIds.stream()
                .map(postsById::get)
                .filter(post -> post != null)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private PostDto toDto(Post post) {
        return toDto(post, Map.of(), Map.of());
    }

    private PostDto toDto(Post post, Map<Long, String> authorNames, Map<Long, String> authorHeadlines) {
        PostDto dto = modelMapper.map(post, PostDto.class);
        Long currentUserId = AuthContextHolder.getCurrentUserId();
        dto.setAuthorName(authorNames.get(post.getUserId()));
        dto.setAuthorHeadline(authorHeadlines.get(post.getUserId()));
        dto.setLikes(postLikeRepository.countByPostId(post.getId()));
        dto.setLiked(currentUserId != null
                && postLikeRepository.existsByUserIdAndPostId(currentUserId, post.getId()));
        dto.setSaved(currentUserId != null
                && savedPostRepository.existsByUserIdAndPostId(currentUserId, post.getId()));
        List<PostCommentDto> comments = postCommentRepository.findByPostIdOrderByCreatedAtAsc(post.getId())
                .stream()
                .map(comment -> modelMapper.map(comment, PostCommentDto.class))
                .collect(Collectors.toList());
        dto.setCommentItems(comments);
        dto.setComments(comments.size());
        return dto;
    }

}

package com.aryan.linkedinProject.postsService.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.aryan.linkedinProject.postsService.client.ConnectionsServiceClient;
import com.aryan.linkedinProject.postsService.dto.PersonDto;
import com.aryan.linkedinProject.postsService.dto.PostCreateRequestDto;
import com.aryan.linkedinProject.postsService.dto.PostDto;
import com.aryan.linkedinProject.postsService.entity.Post;
import com.aryan.linkedinProject.postsService.event.PostCreated;
import com.aryan.linkedinProject.postsService.exception.ResourceNotFoundException;
import com.aryan.linkedinProject.postsService.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service 
@RequiredArgsConstructor 
@Slf4j 
public class PostService {

    private final PostRepository postRepository;
    private final ModelMapper modelMapper;
    private final ConnectionsServiceClient connectionsServiceClient;
    private final KafkaTemplate<Long, PostCreated> postCreatedKafkaTemplate;

    public PostDto createPost(PostCreateRequestDto postCreateRequestDto, Long userId) {
        log.info("creating post for user with id: {}", userId);

        
        Post post = modelMapper.map(postCreateRequestDto, Post.class);
        post.setUserId(userId);
        post = postRepository.save(post);

        List<PersonDto> personDtoList = connectionsServiceClient.getFirstDegreeConnections(userId);
        
        for(PersonDto person: personDtoList){               // SENDING NOTIFICATIONS TO EACH CONNECTION WHEN POST IS CREATED
            PostCreated postCreated = PostCreated.builder()
                .postId(post.getId())
                .content(post.getContent())
                .userId(person.getUserId())
                .ownerUserId(userId)
                .build();
            postCreatedKafkaTemplate.send("post_created_topic", postCreated);
        }

        return modelMapper.map(post, PostDto.class);
    }

    public PostDto getPostById(Long postId) {


        Post post = postRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: "+postId));
        return modelMapper.map(post, PostDto.class);
    }

    public List<PostDto> getAllPostsOfUser(Long userId) {
        List<Post> postList = postRepository.findByUserId(userId);
        return postList
            .stream()
            .map((element) -> modelMapper.map(element, PostDto.class))
            .collect(Collectors.toList());
    }

}

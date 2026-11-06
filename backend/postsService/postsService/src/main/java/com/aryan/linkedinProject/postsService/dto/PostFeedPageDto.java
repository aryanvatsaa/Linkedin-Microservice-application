package com.aryan.linkedinProject.postsService.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PostFeedPageDto {

    private List<PostDto> content;
    private int page;
    private int size;
    private boolean hasNext;
}

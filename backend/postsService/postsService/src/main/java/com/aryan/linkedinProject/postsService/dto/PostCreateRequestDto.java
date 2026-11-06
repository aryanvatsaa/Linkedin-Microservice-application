package com.aryan.linkedinProject.postsService.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data 
public class PostCreateRequestDto {
    @Size(max = 2000)
    private String content;
}

package com.aryan.linkedinProject.postsService.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentCreateRequestDto {

    @NotBlank
    @Size(max = 2000)
    private String content;
}

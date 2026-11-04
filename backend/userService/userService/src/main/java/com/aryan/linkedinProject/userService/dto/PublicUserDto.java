package com.aryan.linkedinProject.userService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PublicUserDto {

    private Long id;
    private String name;
    private String headline;
    private String profilePhotoUrl;
}

package com.aryan.linkedinProject.userService.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PublicUserDto {

    private Long id;
    private String name;
    private String headline;
    private String profilePhotoUrl;
    private String location;
    private List<String> interests;
    private List<String> skills;
}

package com.aryan.linkedinProject.userService.dto;

import java.util.List;

import lombok.Data;

@Data 
public class UserDto {

    private Long id;
    private String name;
    private String email;
    private String headline;
    private String about;
    private String location;
    private List<String> interests;
}

package com.aryan.linkedinProject.userService.dto;

import lombok.Data;

@Data 
public class SignupRequestDto {

    private String name;
    private String email;
    private String password;
}

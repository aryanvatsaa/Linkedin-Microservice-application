package com.aryan.linkedinProject.userService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDto {

    private String accessToken;
    private UserDto user;
}

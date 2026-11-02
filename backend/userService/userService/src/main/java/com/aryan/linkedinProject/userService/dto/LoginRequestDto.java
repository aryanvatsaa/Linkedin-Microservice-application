package com.aryan.linkedinProject.userService.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data 
public class LoginRequestDto {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(max = 72)
    private String password;

}

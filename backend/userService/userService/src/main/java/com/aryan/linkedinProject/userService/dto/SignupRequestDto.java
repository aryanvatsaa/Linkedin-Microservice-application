package com.aryan.linkedinProject.userService.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data 
public class SignupRequestDto {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Email
    @Size(max = 254)
    private String email;

    @NotBlank
    @Size(min = 8, max = 72)
    private String password;
}

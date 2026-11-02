package com.aryan.linkedinProject.userService.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileUpdateDto {

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 160)
    private String headline;

    @Size(max = 2000)
    private String about;

    @Size(max = 120)
    private String location;

    @Size(max = 20)
    private List<@NotBlank @Size(max = 50) String> interests;
}

package com.aryan.linkedinProject.userService.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfilePhotoUpdateDto {

    @NotBlank
    @Size(max = 2048)
    @Pattern(regexp = "^https://.+$", message = "Profile photo URL must use HTTPS")
    private String profilePhotoUrl;
}

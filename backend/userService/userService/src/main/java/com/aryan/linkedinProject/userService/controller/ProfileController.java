package com.aryan.linkedinProject.userService.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aryan.linkedinProject.userService.dto.ProfileUpdateDto;
import com.aryan.linkedinProject.userService.dto.PublicUserDto;
import com.aryan.linkedinProject.userService.dto.UserDto;
import com.aryan.linkedinProject.userService.service.UserProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(userProfileService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ProfileUpdateDto update) {
        return ResponseEntity.ok(userProfileService.updateProfile(userId, update));
    }

    @GetMapping("/directory")
    public ResponseEntity<List<PublicUserDto>> getDirectory(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(userProfileService.getDirectory(userId));
    }
}

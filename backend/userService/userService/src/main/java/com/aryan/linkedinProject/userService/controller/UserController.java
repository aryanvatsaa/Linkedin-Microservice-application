package com.aryan.linkedinProject.userService.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aryan.linkedinProject.userService.dto.LoginRequestDto;
import com.aryan.linkedinProject.userService.dto.SignupRequestDto;
import com.aryan.linkedinProject.userService.dto.AuthResponseDto;
import com.aryan.linkedinProject.userService.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/auth")
@RequiredArgsConstructor 
public class UserController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDto> signUp(@Valid @RequestBody SignupRequestDto signupRequestDto){
        AuthResponseDto authResponse = authService.signUp(signupRequestDto);
        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequestDto){
        AuthResponseDto authResponse = authService.login(loginRequestDto);
        return ResponseEntity.ok(authResponse);
    }

}

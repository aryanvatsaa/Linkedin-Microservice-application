package com.aryan.linkedinProject.userService.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aryan.linkedinProject.userService.dto.LoginRequestDto;
import com.aryan.linkedinProject.userService.dto.SignupRequestDto;
import com.aryan.linkedinProject.userService.dto.UserDto;
import com.aryan.linkedinProject.userService.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/auth")
@RequiredArgsConstructor 
public class UserController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<UserDto> signUp(@RequestBody SignupRequestDto signupRequestDto){
        UserDto userDto = authService.signUp(signupRequestDto);
        return new ResponseEntity<>(userDto, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDto loginRequestDto){
        String toekn = authService.login(loginRequestDto);
        return ResponseEntity.ok(toekn);
    }


}

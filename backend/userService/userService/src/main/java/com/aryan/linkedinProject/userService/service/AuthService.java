package com.aryan.linkedinProject.userService.service;

import org.modelmapper.ModelMapper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aryan.linkedinProject.userService.dto.LoginRequestDto;
import com.aryan.linkedinProject.userService.dto.SignupRequestDto;
import com.aryan.linkedinProject.userService.dto.AuthResponseDto;
import com.aryan.linkedinProject.userService.dto.UserDto;
import com.aryan.linkedinProject.userService.entity.User;
import com.aryan.linkedinProject.userService.event.UserCreatedEvent;
import com.aryan.linkedinProject.userService.exception.BadRequestException;
import com.aryan.linkedinProject.userService.repository.UserRepository;
import com.aryan.linkedinProject.userService.utils.BCrypt;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service 
@RequiredArgsConstructor 
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final JwtService jwtService;
    private final KafkaTemplate<Long, UserCreatedEvent> userCreatedEventKafkaTemplate;

    @Transactional
    public AuthResponseDto signUp(SignupRequestDto signupRequestDto) {
        String email = signupRequestDto.getEmail().trim().toLowerCase();
        log.info("Signing up a user");

        boolean exists = userRepository.existsByEmail(email);
        if(exists){
            throw new BadRequestException("User already exists");
        }

        User user = modelMapper.map(signupRequestDto, User.class);
        user.setName(signupRequestDto.getName().trim());
        user.setEmail(email);
        user.setPassword(BCrypt.hash(signupRequestDto.getPassword()));

        user = userRepository.save(user);

        UserCreatedEvent userCreatedEvent = UserCreatedEvent.builder()
                .userId(user.getId())
                .name(user.getName())
                .build();

        userCreatedEventKafkaTemplate.send("user_created_topic", userCreatedEvent);


        return createAuthResponse(user);
        
    }

    @Transactional(readOnly = true)
    public AuthResponseDto login(LoginRequestDto loginRequestDto) {
        String email = loginRequestDto.getEmail().trim().toLowerCase();
        log.info("login request received");

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadRequestException("Incorrect email or password !!"));

        boolean isPasswordMatch = BCrypt.match(loginRequestDto.getPassword(), user.getPassword());

        if(!isPasswordMatch){
            throw new BadRequestException("Incorrect email or password !!");
        }

        return createAuthResponse(user);
    }

    private AuthResponseDto createAuthResponse(User user) {
        return new AuthResponseDto(
                jwtService.generateAccessToken(user),
                modelMapper.map(user, UserDto.class));
    }

}

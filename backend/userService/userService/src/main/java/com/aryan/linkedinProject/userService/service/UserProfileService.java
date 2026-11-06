package com.aryan.linkedinProject.userService.service;

import java.util.List;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.kafka.core.KafkaTemplate;

import com.aryan.linkedinProject.userService.dto.ProfileUpdateDto;
import com.aryan.linkedinProject.userService.dto.ProfilePhotoUpdateDto;
import com.aryan.linkedinProject.userService.dto.PublicUserDto;
import com.aryan.linkedinProject.userService.dto.UserDto;
import com.aryan.linkedinProject.userService.entity.User;
import com.aryan.linkedinProject.userService.event.UserUpdatedEvent;
import com.aryan.linkedinProject.userService.exception.ResourceNotFoundException;
import com.aryan.linkedinProject.userService.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final KafkaTemplate<Long, UserUpdatedEvent> userUpdatedEventKafkaTemplate;

    @Transactional(readOnly = true)
    public UserDto getProfile(Long userId) {
        return toUserDto(findUser(userId));
    }

    @Transactional
    public UserDto updateProfile(Long userId, ProfileUpdateDto update) {
        User user = findUser(userId);
        user.setName(update.getName().trim());
        user.setHeadline(trimToNull(update.getHeadline()));
        user.setAbout(trimToNull(update.getAbout()));
        user.setLocation(trimToNull(update.getLocation()));
        replaceValues(user.getInterests(), update.getInterests());
        replaceValues(user.getSkills(), update.getSkills());
        replaceValues(user.getExperience(), update.getExperience());
        replaceValues(user.getEducation(), update.getEducation());
        userUpdatedEventKafkaTemplate.send("user_updated_topic", UserUpdatedEvent.builder()
                .userId(user.getId())
                .name(user.getName())
                .headline(user.getHeadline())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .build());
        return toUserDto(user);
    }

    @Transactional
    public UserDto updateProfilePhoto(Long userId, ProfilePhotoUpdateDto update) {
        User user = findUser(userId);
        user.setProfilePhotoUrl(update.getProfilePhotoUrl().trim());
        userUpdatedEventKafkaTemplate.send("user_updated_topic", UserUpdatedEvent.builder()
                .userId(user.getId())
                .name(user.getName())
                .headline(user.getHeadline())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .build());
        return toUserDto(user);
    }

    @Transactional(readOnly = true)
    public List<PublicUserDto> getDirectory(Long excludedUserId) {
        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(excludedUserId))
                .map(user -> new PublicUserDto(
                        user.getId(), user.getName(), user.getHeadline(), user.getProfilePhotoUrl(),
                        user.getLocation(), List.copyOf(user.getInterests()), List.copyOf(user.getSkills())))
                .toList();
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserDto toUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setHeadline(user.getHeadline());
        dto.setAbout(user.getAbout());
        dto.setLocation(user.getLocation());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        dto.setInterests(List.copyOf(user.getInterests()));
        dto.setSkills(List.copyOf(user.getSkills()));
        dto.setExperience(List.copyOf(user.getExperience()));
        dto.setEducation(List.copyOf(user.getEducation()));
        return dto;
    }

    private void replaceValues(List<String> target, List<String> values) {
        target.clear();
        if (values == null) {
            return;
        }
        Set<String> seen = new HashSet<>();
        for (String value : values) {
            String trimmed = value.trim();
            if (!trimmed.isEmpty() && seen.add(trimmed.toLowerCase(Locale.ROOT))) {
                target.add(trimmed);
            }
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}

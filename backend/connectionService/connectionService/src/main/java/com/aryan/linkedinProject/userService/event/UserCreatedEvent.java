package com.aryan.linkedinProject.userService.event;

import lombok.Data;

@Data
public class UserCreatedEvent {

    private Long userId;
    private String name;

}

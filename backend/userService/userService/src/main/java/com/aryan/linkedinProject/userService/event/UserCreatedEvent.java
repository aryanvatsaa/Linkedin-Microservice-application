package com.aryan.linkedinProject.userService.event;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserCreatedEvent {

    private Long userId;
    private String name;

}

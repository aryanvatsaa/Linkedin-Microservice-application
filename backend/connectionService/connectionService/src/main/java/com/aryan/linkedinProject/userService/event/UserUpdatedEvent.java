package com.aryan.linkedinProject.userService.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdatedEvent {

    private Long userId;
    private String name;
    private String headline;
}

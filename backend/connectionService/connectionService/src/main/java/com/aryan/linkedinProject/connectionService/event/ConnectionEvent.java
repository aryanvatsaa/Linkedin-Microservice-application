package com.aryan.linkedinProject.connectionService.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionEvent {

    private Long recipientUserId;
    private Long actorUserId;
    private String type;
}

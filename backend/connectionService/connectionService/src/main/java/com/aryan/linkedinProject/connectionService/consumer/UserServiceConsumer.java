package com.aryan.linkedinProject.connectionService.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.aryan.linkedinProject.connectionService.service.PersonService;
import com.aryan.linkedinProject.userService.event.UserCreatedEvent;
import com.aryan.linkedinProject.userService.event.UserUpdatedEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j 
@RequiredArgsConstructor 
public class UserServiceConsumer {

    private final PersonService personService;

    @KafkaListener(topics = "user_created_topic")
    public void handlePersonCreated(UserCreatedEvent userCreatedEvent){
        log.info("handlePersonCreated: {}", userCreatedEvent);
        personService.createPerson(userCreatedEvent.getUserId(), userCreatedEvent.getName());
    }

    @KafkaListener(topics = "user_updated_topic")
    public void handlePersonUpdated(UserUpdatedEvent event) {
        personService.updatePerson(
                event.getUserId(), event.getName(), event.getHeadline(), event.getProfilePhotoUrl());
    }

}

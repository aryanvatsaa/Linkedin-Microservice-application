package com.aryan.linkedinProject.connectionService.service;

import org.springframework.stereotype.Service;

import com.aryan.linkedinProject.connectionService.entity.Person;
import com.aryan.linkedinProject.connectionService.repository.PersonRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j 
public class PersonService {

    private final PersonRepository personRepository;

    public void createPerson(Long userId, String name){
        if (personRepository.findByUserId(userId).isPresent()) {
            log.info("Person node already exists for user {}", userId);
            return;
        }
        Person person = Person.builder().name(name).userId(userId).build();
        personRepository.save(person);
    }

    public void updatePerson(Long userId, String name, String headline, String profilePhotoUrl) {
        Person person = personRepository.findByUserId(userId)
                .map(existing -> {
                    existing.setName(name);
                    existing.setHeadline(headline);
                    existing.setProfilePhotoUrl(profilePhotoUrl);
                    return existing;
                })
                .orElseGet(() -> Person.builder()
                        .userId(userId)
                        .name(name)
                        .headline(headline)
                        .profilePhotoUrl(profilePhotoUrl)
                        .build());
        personRepository.save(person);
    }

}

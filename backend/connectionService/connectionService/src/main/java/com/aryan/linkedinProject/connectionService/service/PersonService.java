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
        Person person = Person.builder().name(name).userId(userId).build();
        personRepository.save(person);
    }

}

package com.aryan.linkedinProject.connectionService.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aryan.linkedinProject.connectionService.entity.Person;
import com.aryan.linkedinProject.connectionService.repository.PersonRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service 
@Slf4j 
@RequiredArgsConstructor 
public class ConnectionsService {

    private final PersonRepository personRepository;

    public List<Person> getFirstDegreeConnectionsOfUser(Long userId){
        log.info("Getting first degree connections of the user with ID:{}", userId);

        return personRepository.getFirstDegreeConnection(userId);
    }

}

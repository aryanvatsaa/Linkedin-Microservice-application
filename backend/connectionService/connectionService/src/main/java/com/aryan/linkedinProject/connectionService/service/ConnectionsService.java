package com.aryan.linkedinProject.connectionService.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.kafka.core.KafkaTemplate;

import com.aryan.linkedinProject.connectionService.auth.AuthContextHolder;
import com.aryan.linkedinProject.connectionService.entity.Person;
import com.aryan.linkedinProject.connectionService.exception.BadRequestException;
import com.aryan.linkedinProject.connectionService.repository.PersonRepository;
import com.aryan.linkedinProject.connectionService.event.ConnectionEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service 
@Slf4j 
@RequiredArgsConstructor 
public class ConnectionsService {

    private final PersonRepository personRepository;
    private final KafkaTemplate<Long, ConnectionEvent> connectionEventsKafkaTemplate;

    public List<Person> getFirstDegreeConnectionsOfUser(Long userId){
        Long currentUserId = AuthContextHolder.getCurrentUserId();
        if (currentUserId == null || !currentUserId.equals(userId)) {
            throw new BadRequestException("You can only view your own connections");
        }
        log.info("Getting first degree connections of the user with ID:{}", userId);

        return personRepository.getFirstDegreeConnection(userId);
    }

    public List<Person> getIncomingRequests() {
        return personRepository.getIncomingRequests(AuthContextHolder.getCurrentUserId());
    }

    public List<Person> getOutgoingRequests() {
        return personRepository.getOutgoingRequests(AuthContextHolder.getCurrentUserId());
    }

    public void sendConnectionRequest(Long receiverId) {
        Long senderId = AuthContextHolder.getCurrentUserId();
        if (senderId == null) {
            throw new BadRequestException("Authentication is required");
        }
        log.info("sending connection request with senderId: {}, receiverId: {}", senderId, receiverId);

        if (senderId.equals(receiverId)) {
            throw new BadRequestException("Both sender and receiver are the same");
        }

        if (personRepository.findByUserId(senderId).isEmpty()
                || personRepository.findByUserId(receiverId).isEmpty()) {
            throw new BadRequestException("A connection participant does not exist");
        }

        boolean alreadySentRequest = personRepository.connectionRequestExists(senderId, receiverId);
        boolean reverseRequestExists = personRepository.connectionRequestExists(receiverId, senderId);
        if (alreadySentRequest || reverseRequestExists) {
            throw new BadRequestException("Connection request already exists, cannot send again");
        }

        boolean alreadyConnected = personRepository.alreadyConnected(senderId, receiverId);
        if (alreadyConnected) {
            throw new BadRequestException("Already connected users, cannot add connection request");
        }

        personRepository.addConnectionRequest(senderId, receiverId);
        connectionEventsKafkaTemplate.send("connection_events_topic", ConnectionEvent.builder()
                .recipientUserId(receiverId)
                .actorUserId(senderId)
                .type("connection_request")
                .build());
        log.info("Successfully sent the connection request");
    }

    public void acceptConnectionRequest(Long senderId) {
        Long receiverId = AuthContextHolder.getCurrentUserId();
        if (receiverId == null) {
            throw new BadRequestException("Authentication is required");
        }
        log.info("Accepting a connection request with senderId: {}, receiverId: {}", senderId, receiverId);

        if (senderId.equals(receiverId)) {
            throw new BadRequestException("Both sender and receiver are the same");
        }

        boolean alreadyConnected = personRepository.alreadyConnected(senderId, receiverId);
        if (alreadyConnected) {
            throw new BadRequestException("Already connected users, cannot accept connection request again");
        }

        boolean alreadySentRequest = personRepository.connectionRequestExists(senderId, receiverId);
        if (!alreadySentRequest) {
            throw new BadRequestException("No Connection request exists, cannot accept without request");
        }

        personRepository.acceptConnectionRequest(senderId, receiverId);
        connectionEventsKafkaTemplate.send("connection_events_topic", ConnectionEvent.builder()
                .recipientUserId(senderId)
                .actorUserId(receiverId)
                .type("connection_accepted")
                .build());

        log.info("Successfully accepted the connection request with senderId: {}, receiverId: {}", senderId,
                receiverId);

    }

    public void rejectConnectionRequest(Long senderId) {
        Long receiverId = AuthContextHolder.getCurrentUserId();
        if (receiverId == null) {
            throw new BadRequestException("Authentication is required");
        }
        log.info("Rejecting a connection request with senderId: {}, receiverId: {}", senderId, receiverId);

        if (senderId.equals(receiverId)) {
            throw new BadRequestException("Both sender and receiver are the same");
        }

        boolean alreadySentRequest = personRepository.connectionRequestExists(senderId, receiverId);
        if (!alreadySentRequest) {
            throw new BadRequestException("No Connection request exists, cannot reject it");
        }

        personRepository.rejectConnectionRequest(senderId, receiverId);

        log.info("Successfully rejected the connection request with senderId: {}, receiverId: {}", senderId,
                receiverId);
    }

    public void cancelOutgoingRequest(Long receiverId) {
        Long senderId = AuthContextHolder.getCurrentUserId();
        if (senderId == null) {
            throw new BadRequestException("Authentication is required");
        }
        if (senderId.equals(receiverId) || !personRepository.connectionRequestExists(senderId, receiverId)) {
            throw new BadRequestException("No outgoing connection request exists for this user");
        }
        personRepository.cancelConnectionRequest(senderId, receiverId);
    }

    public void removeConnection(Long connectionUserId) {
        Long currentUserId = AuthContextHolder.getCurrentUserId();
        if (currentUserId == null) {
            throw new BadRequestException("Authentication is required");
        }
        if (currentUserId.equals(connectionUserId)) {
            throw new BadRequestException("You cannot remove yourself as a connection");
        }
        if (!personRepository.alreadyConnected(currentUserId, connectionUserId)) {
            throw new BadRequestException("No connection exists with this user");
        }

        personRepository.removeConnection(currentUserId, connectionUserId);
        log.info("Removed connection between userId: {} and userId: {}", currentUserId, connectionUserId);
    }



}

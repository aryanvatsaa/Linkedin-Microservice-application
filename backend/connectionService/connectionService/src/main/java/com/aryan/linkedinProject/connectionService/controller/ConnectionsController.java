package com.aryan.linkedinProject.connectionService.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aryan.linkedinProject.connectionService.entity.Person;
import com.aryan.linkedinProject.connectionService.auth.AuthContextHolder;
import com.aryan.linkedinProject.connectionService.service.ConnectionsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController 
@RequestMapping("/core")
@RequiredArgsConstructor 
@Slf4j 
public class ConnectionsController {

    private final ConnectionsService connectionsService;

    @GetMapping("/me")
    public ResponseEntity<List<Person>> getMyConnections() {
        return ResponseEntity.ok(connectionsService.getFirstDegreeConnectionsOfUser(
                AuthContextHolder.getCurrentUserId()));
    }

    @GetMapping("/{userId}/first-degree")
    public ResponseEntity<List<Person>> getFirstDegreeConnections(@PathVariable Long userId) {

        List<Person> personList = connectionsService.getFirstDegreeConnectionsOfUser(userId);
        return ResponseEntity.ok(personList);
    }

    @GetMapping("/requests/incoming")
    public ResponseEntity<List<Person>> getIncomingRequests() {
        return ResponseEntity.ok(connectionsService.getIncomingRequests());
    }

    @GetMapping("/requests/outgoing")
    public ResponseEntity<List<Person>> getOutgoingRequests() {
        return ResponseEntity.ok(connectionsService.getOutgoingRequests());
    }

    @PostMapping("/request/{userId}")
    public ResponseEntity<Void> sendConnectionRequest(@PathVariable Long userId) {
        connectionsService.sendConnectionRequest(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/accept/{userId}")
    public ResponseEntity<Void> acceptConnectionRequest(@PathVariable Long userId) {
        connectionsService.acceptConnectionRequest(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reject/{userId}")
    public ResponseEntity<Void> rejectConnectionRequest(@PathVariable Long userId) {
        connectionsService.rejectConnectionRequest(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/requests/outgoing/{userId}")
    public ResponseEntity<Void> cancelOutgoingRequest(@PathVariable Long userId) {
        connectionsService.cancelOutgoingRequest(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeConnection(@PathVariable Long userId) {
        connectionsService.removeConnection(userId);
        return ResponseEntity.noContent().build();
    }

}

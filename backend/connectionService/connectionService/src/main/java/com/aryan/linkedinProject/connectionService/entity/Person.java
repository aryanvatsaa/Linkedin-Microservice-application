package com.aryan.linkedinProject.connectionService.entity;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Node 
@Getter
@Setter
@Builder 
public class Person {

    @Id 
    @GeneratedValue 
    private Long id;

    private Long userId;

    private String name;

    
}

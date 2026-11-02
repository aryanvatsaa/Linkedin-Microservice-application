package com.aryan.linkedinProject.userService.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Getter 
@Setter 
@Table(name = "users")
public class User {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String headline;
    private String about;
    private String location;

    @ElementCollection
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest", nullable = false)
    private List<String> interests = new ArrayList<>();

}

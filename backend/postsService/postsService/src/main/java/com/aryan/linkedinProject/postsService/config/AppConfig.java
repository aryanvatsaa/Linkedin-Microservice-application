package com.aryan.linkedinProject.postsService.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import feign.form.spring.SpringFormEncoder;

@Configuration 
public class AppConfig {

    @Bean 
    public ModelMapper modelMapper(){
        return new ModelMapper();
    }

    @Bean 
    public SpringFormEncoder feignFormEncoder(){
        return new SpringFormEncoder();
    }

}

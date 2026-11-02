package com.aryan.linkedinProject.connectionService.auth;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;

@Component
public class RequestInterceptor implements HandlerInterceptor{


    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String userId = request.getHeader("X-User-Id");
        if (userId == null || userId.isBlank()) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }
        try {
            AuthContextHolder.setCurrentUserId(Long.valueOf(userId));
            return true;
        } catch (NumberFormatException exception) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }
    }


    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
            Exception ex) {
        AuthContextHolder.clear();
    }

    

    
}

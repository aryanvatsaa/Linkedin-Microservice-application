package com.aryan.linkedinProject.APIGateway.config;

import com.aryan.linkedinProject.APIGateway.filter.AuthenticationFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiRoutesConfiguration {

    @Bean
    RouteLocator apiRoutes(
            RouteLocatorBuilder builder,
            AuthenticationFilter authenticationFilter) {
        AuthenticationFilter.Config authenticationConfig = new AuthenticationFilter.Config();
        return builder.routes()
                .route("user-service", route -> route.path("/api/v1/users/auth/**")
                        .filters(filters -> filters.stripPrefix(2))
                        .uri("lb://USER-SERVICE"))
                .route("user-profile-service", route -> route.path(
                                "/api/v1/users/profile", "/api/v1/users/directory")
                        .filters(filters -> filters.stripPrefix(2)
                                .filter(authenticationFilter.apply(authenticationConfig)))
                        .uri("lb://USER-SERVICE"))
                .route("posts-service", route -> route.path("/api/v1/posts/**")
                        .filters(filters -> filters.stripPrefix(2)
                                .filter(authenticationFilter.apply(authenticationConfig)))
                        .uri("lb://POSTS-SERVICE"))
                .route("connections-service", route -> route.path("/api/v1/connections/**")
                        .filters(filters -> filters.stripPrefix(2)
                                .filter(authenticationFilter.apply(authenticationConfig)))
                        .uri("lb://CONNECTIONS-SERVICE"))
                .route("notifications-service", route -> route.path("/api/v1/notifications/**")
                        .filters(filters -> filters.stripPrefix(2)
                                .filter(authenticationFilter.apply(authenticationConfig)))
                        .uri("lb://NOTIFICATION-SERVICE"))
                .build();
    }
}

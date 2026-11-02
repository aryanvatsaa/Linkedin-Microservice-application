package com.aryan.linkedinProject.APIGateway;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.RouteLocator;

@SpringBootTest(properties = "eureka.client.enabled=false")
class ApiGatewayApplicationTests {

	@Autowired
	private RouteLocator routeLocator;

	@Test
	void contextLoads() {
	}

	@Test
	void userServiceRouteIsConfigured() {
		boolean userRouteConfigured = Boolean.TRUE.equals(
				routeLocator.getRoutes().any(route -> "user-service".equals(route.getId())).block());

		assertTrue(userRouteConfigured);
	}

	@Test
	void authenticatedServiceRoutesAreConfigured() {
		List<String> routeIds = routeLocator.getRoutes()
				.map(route -> route.getId())
				.collectList()
				.block();

		assertTrue(routeIds.containsAll(List.of(
				"user-profile-service",
				"posts-service",
				"connections-service",
				"notifications-service")));
	}

}

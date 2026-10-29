package com.aryan.linkedinProject.APIGateway;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.RouteLocator;

@SpringBootTest
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

}

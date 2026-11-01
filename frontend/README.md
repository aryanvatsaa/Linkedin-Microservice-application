# Nexora frontend

Nexora is a React application built with Vite. Its local development server proxies
`/api/v1` requests to the API Gateway at `http://localhost:8081`; the browser does
not call individual microservices directly.

## Run locally

```sh
npm install
npm run dev
```

To use a different Gateway URL, set `VITE_API_BASE_URL` to its `/api/v1` base URL.
The deployment environment must allow browser requests to that Gateway origin.

## Integrated flows

- Sign-up and sign-in use the user service through `/api/v1/users/auth/signup`
  and `/api/v1/users/auth/login`. Both return an access token and user profile.
- Authenticated profile, directory, connection requests, feed, post publishing,
  likes, and notification-read operations go through the Gateway.
- The posts service owns post creation and likes; it calls the uploader service for
  optional images and publishes post activity through Kafka. The connection service
  owns connection state and publishes connection activity through Kafka.
- Comments and saved posts are persisted by the posts service. New comments on
  another member's post publish an asynchronous Kafka notification.
- The home feed combines the signed-in user's posts with posts from first-degree
  connections.

Messaging and opportunities are intentionally out of scope.

The backend creates connection graph nodes from Kafka user-created events and
persists post/connection notification events asynchronously. Start Kafka before
testing signup, connection requests, or the notification event flow. Each service
also requires its own configured database, Eureka, and (for connections) Neo4j.

## Checks

```sh
npm run lint
npm run build
```

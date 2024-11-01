# Group Service

The `group_service` is a Node.js microservice designed to manage groups in a social media application. It registers with Eureka for service discovery, connects to a MongoDB database, and uses Kafka for messaging.

To view all services for this social media system, lets visit: `https://github.com/goddie9x?tab=repositories&q=social`

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

## Setup

### 1. Clone the Repository

Clone the `group_service` repository and navigate into the directory:

```bash
git clone https://github.com/goddie9x/social_group_service.git
cd group_service
```

### 2. Clone Utility Package

Clone the `social_utils` package as a subdirectory in the project root:

```bash
git clone https://github.com/goddie9x/social_utils.git utils
```

### 3. Configuration

Set up environment variables by creating a `.env` file in the root directory with the following placeholders:

```dotenv
PORT=3008
MONGODB_URI=mongodb://<username>:<password>@mongo:27017/group # replace with actual username and password
APP_PATH=/api/v1/groups
IP_ADDRESS=group-service
APP_NAME=group-service
HOST_NAME=group-service
EUREKA_DISCOVERY_SERVER_HOST=discovery-server
EUREKA_DISCOVERY_SERVER_PORT=8761
```

These environment variables are necessary for configuring MongoDB, Eureka registration, and service details.

## Package Installation

Install dependencies:

```bash
npm install
```

## Running the Service Locally

To start the service locally:

```bash
npm start
```

The service will run on `http://localhost:3008` by default.

## Running with Docker

1. **Dockerfile**:

   Create a `Dockerfile` in the project root with the following content:

   ```dockerfile
   FROM node:18-alpine
   WORKDIR /usr/src/app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 3008
   CMD ["npm", "start"]
   ```

2. **Build and Run the Docker Container**:

   Build and start the Docker container:

   ```bash
   docker build -t group-service .
   docker run -p 3008:3008 --env-file .env group-service
   ```

## Running with Docker Compose

To run `group_service` within a Docker Compose setup, include the following service definition:

```yaml
group-service:
  image: group-service
  build:
    context: .
  ports:
    - 3008:3008
  environment:
    - PORT=3008
    - MONGODB_URI=mongodb://<username>:<password>@mongo:27017/group # replace with actual username and password
    - APP_PATH=/api/v1/groups
    - IP_ADDRESS=group-service
    - APP_NAME=group-service
    - HOST_NAME=group-service
    - EUREKA_DISCOVERY_SERVER_HOST=discovery-server
    - EUREKA_DISCOVERY_SERVER_PORT=8761
  depends_on:
    - mongo
    - discovery-server
  networks:
    - social-media-network
```

Start all services with Docker Compose:

```bash
docker-compose up --build
```

## Accessing the Service

Once running, the `group_service` will be available at `http://localhost:3008/api/v1/groups`.

### Useful Commands

- **Stop Containers**: Use `docker-compose down` to stop all services and remove the containers.
- **Restart Containers**: Run `docker-compose restart` to restart the services without rebuilding the images.

This setup enables seamless orchestration of the social media microservices with an API Gateway for managing external client requests.

## Contributing

Contributions are welcome. Please clone this repository and submit a pull request with your changes. Ensure that your changes are well-tested and documented.

## License

This project is licensed under the MIT License. See `LICENSE` for more details.
# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2.7
WORKDIR /usr/src/app
COPY ui/package*.json .
RUN bun install
COPY ui/. .

# Copy backend model types
COPY auth/dist/models ../auth/dist/models

# Copy auth model types
COPY backend/dist/models ../backend/dist/models

# Install nodemon globally
RUN bun add -g nodemon

CMD ["bun", "dev"]
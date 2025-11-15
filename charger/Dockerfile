FROM oven/bun:1.2.7
WORKDIR /usr/src/app
COPY package*.json .
RUN bun install
COPY . .

# Install nodemon globally
RUN bun add -g nodemon

CMD ["bun", "run", "dev"]
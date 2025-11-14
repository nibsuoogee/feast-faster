# --- Build Stage ---
    FROM oven/bun:1.2.5 AS builder
    WORKDIR /usr/src/app
    ENV NODE_ENV=production
    
    # Copy package.json and install dependencies
    COPY package*.json ./
    RUN bun install --frozen-lockfile
    
    # Copy the rest of the source code
    COPY . .
    
    # Build the app
    RUN bun build --compile --minify --sourcemap src/index.ts --outfile bin/charger
    
    # --- Run Stage (Minimized) ---
    FROM oven/bun:1.2.5-slim AS runner
    WORKDIR /app
    
    # Copy the binary
    COPY --from=builder /usr/src/app/bin/charger /app/bin/charger
    
    # Ensure it's executable
    RUN chmod +x /app/bin/charger
    
    # Run the app directly
    CMD ["/app/bin/charger"]
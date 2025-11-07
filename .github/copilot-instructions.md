# AI Agent Instructions for Feast Faster

## Project Overview
Feast Faster is a multi-service application for restaurant food delivery and EV charging management. The system consists of several microservices built with different technologies:

- **UI**: React/TypeScript frontend (port 5173)
- **Auth Service**: Bun/Elysia service for authentication (port 3001)
- **Backend Service**: Bun/Elysia service for main business logic (port 3000)
- **Processor Service**: Python/FastAPI service for data processing (port 8000)
- **Database**: PostgreSQL 17.2 for data persistence (port 5432)

## Architecture Patterns

### Service Communication
- All services communicate through a Traefik reverse proxy (ports 80/443)
- Services use JWT tokens for authentication, shared via `JWT_SECRET` environment variable
- Inter-service communication happens over the `cloud_project` Docker network

### Authentication Flow
1. User authentication flows through `/auth/login` and `/auth/register` endpoints
2. Auth service generates JWTs that are required for all protected endpoints
3. See `auth/src/routes/loginRouter.ts` and `ui/src/contexts/AuthContext.tsx` for implementation

### Data Model
Key database entities (see `database/init.sql`):
- Users (with roles: driver, restaurant_manager)
- Settings (vehicle and charging preferences)
- Menu items, orders, and charging sessions

## Development Workflow

### Environment Setup
1. Required tools: Docker, Node.js, Bun, Python
2. Copy `.env.example` to `.env` and configure variables
3. Build Docker images: `./build-docker-images.sh`

### Running the Application
```bash
docker-compose up
```
Access services at:
- UI: https://app.localhost
- Auth: https://auth.localhost
- Backend: https://backend.localhost
- Processor: https://processor.localhost

### Code Conventions
- TypeScript strict mode enabled in all JS/TS services
- React components use functional style with hooks
- API endpoints follow RESTful conventions
- Error handling uses the `tryCatch` utility in backend services

## Common Tasks

### Adding New API Endpoints
1. Create route file in `src/routes/`
2. Add route to main application in `src/index.ts`
3. Add TypeScript types in `types.ts`
4. Update frontend API client in `ui/src/lib/requests.ts`

### Database Changes
1. Add new schema changes to `database/init.sql`
2. Update relevant model files in service directories
3. Rebuild and restart services to apply changes
# processor/app/main.py
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from app.schemas import ProposalRequest, ProposalResponse
from app.model import get_proposal_generator, ProposalGenerator
from app.config import settings, logger

# JWT Bearer token security scheme
security = HTTPBearer()

app = FastAPI(title=settings.APP_NAME)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)


# Custom middleware to log requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    path = request.url.path
    method = request.method

    logger.info(f"Request: {method} {path}")

    # Continue processing the request
    response = await call_next(request)

    logger.info(f"Response status: {response.status_code}")
    return response


# JWT verification dependency
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    # Log token info (careful not to log the entire token in production)
    token_preview = token[:10] + "..." if len(token) > 10 else token
    logger.info(f"Verifying token: {token_preview}")

    if not settings.JWT_SECRET:
        logger.error("JWT_SECRET not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server is not configured for authentication",
        )

    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        logger.info(f"Token verified successfully. Payload: {payload}")

        # # Check if the payload.permissions includes recommend:read
        # if "recommend:read" not in payload.get("permissions", []):
        #     logger.error("User does not have permission to read recommendations")
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Insufficient permissions",
        #     )

        return payload
    except JWTError as e:
        logger.error(f"JWT verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
"""
Main FastAPI Application Entrypoint.

WHAT THIS MODULE DOES:
Instantiates the FastAPI application, mounts CORS middleware, connects database models, and registers routers.

WHY IT'S STRUCTURED THIS WAY:
1. Centralizes router registrations (`users`, `channels`, `messages`, `reactions`, `ws`).
2. Configures CORS policies for seamless React frontend integration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.routers import users, channels, messages, reactions
from app.websocket import ws_router

# Initialize database tables if not already created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-time Mini Slack Backend API",
    version="1.0.0"
)

# Enable CORS for React frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(users.router)
app.include_router(channels.router)
app.include_router(messages.router)
app.include_router(reactions.router)
app.include_router(ws_router.router)


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend operational status."""
    return {"status": "healthy", "service": "Mini Slack Backend"}

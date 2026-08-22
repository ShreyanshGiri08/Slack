"""
Main FastAPI Application Entrypoint.

WHAT THIS MODULE DOES:
Instantiates FastAPI app, mounts CORS middleware, executes database auto-migrations, and registers API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, run_auto_migrations
from app.routers import users, channels, messages, reactions
from app.websocket import ws_router

# Execute auto migrations and create tables if not present
run_auto_migrations()
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-time Mini Slack Backend API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(channels.router)
app.include_router(messages.router)
app.include_router(reactions.router)
app.include_router(ws_router.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "Mini Slack Backend"}

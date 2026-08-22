"""
Main FastAPI Application Entrypoint.

WHAT THIS MODULE DOES:
Configures FastAPI app, database auto-migrations, and CORS middleware including Chrome Private Network Access (PNA) headers.

WHY IT'S STRUCTURED THIS WAY:
1. `Access-Control-Allow-Private-Network: true` allows clients connecting via local IP (e.g. 172.x.x.x or 192.x.x.x) to reach loopback localhost services without browser PNA CORS blocking.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, run_auto_migrations
from app.routers import users, channels, messages, reactions
from app.websocket import ws_router

run_auto_migrations()
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-time Mini Slack Backend API",
    version="2.0.0"
)

# Enable CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_private_network_access_header(request: Request, call_next):
    """
    Middleware allowing Chrome Private Network Access (PNA) from local IP origins.
    """
    response = await call_next(request)
    response.headers["Access-Control-Allow-Private-Network"] = "true"
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


app.include_router(users.router)
app.include_router(channels.router)
app.include_router(messages.router)
app.include_router(reactions.router)
app.include_router(ws_router.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "Mini Slack Backend"}

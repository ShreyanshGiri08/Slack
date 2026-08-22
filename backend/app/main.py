"""
Main FastAPI Application Entrypoint.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base, get_db, run_auto_migrations
from app.routers import users, channels, messages, reactions
from app.websocket import ws_router
from app.services.channel_service import seed_default_channels

# Run schema migrations before anything else
run_auto_migrations()
Base.metadata.create_all(bind=engine)

# Seed default channels
from app.core.database import SessionLocal as _SessionLocal
_db = _SessionLocal()
try:
    seed_default_channels(_db)
finally:
    _db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-time Mini Slack Backend API",
    version="2.0.0"
)

# ✅ CRITICAL FIX: allow_credentials=True cannot be combined with allow_origins=["*"]
# We set explicit origins list instead, or disable credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.middleware("http")
async def add_pna_header(request: Request, call_next):
    """
    Chrome Private Network Access (PNA) header middleware.
    Required when browser origin is a non-loopback IP accessing a loopback service.
    """
    if request.method == "OPTIONS":
        response = JSONResponse(content={}, status_code=200)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Private-Network"] = "true"
        return response

    response = await call_next(request)
    response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response


app.include_router(users.router)
app.include_router(channels.router)
app.include_router(messages.router)
app.include_router(reactions.router)
app.include_router(ws_router.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "Mini Slack Backend"}

"""
Database Connection & Session Management Module.

WHAT THIS MODULE DOES:
Configures the SQLAlchemy ORM engine, creates the session factory, and provides
a FastAPI dependency (`get_db`) for clean per-request database transaction lifecycles.

WHY IT'S STRUCTURED THIS WAY:
1. Isolating DB configuration keeps database logic decoupled from API routing.
2. The `get_db` generator pattern guarantees that database connections are automatically
   closed after each request context completes, preventing database connection leaks.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Create SQLAlchemy Database Engine
# pool_pre_ping=True checks connection validity before executing queries (essential for Neon serverless Postgres)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Create SessionLocal class for instantiating DB sessions per request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base for ORM model class inheritance
Base = declarative_base()


def get_db():
    """
    FastAPI Dependency that yields a database session for a single HTTP request context.

    WHAT IT DOES:
    Instantiates a new database session, yields it to the route handler, and closes it when finished.

    WHY IT IS NEEDED:
    Ensures transactional safety and connection pool cleanup per HTTP request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

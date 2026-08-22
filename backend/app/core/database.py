"""
Database Connection & Auto-Migration Management Module.

WHAT THIS MODULE DOES:
Configures SQLAlchemy engine, session generator, and performs auto-healing schema migrations on startup (e.g. adding missing `bio`, `password`, or `recipient_id` columns if not present in Neon Postgres).

WHY IT'S STRUCTURED THIS WAY:
1. Prevents database query crashes if new columns were added to models after initial table creation.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Create SQLAlchemy Engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def run_auto_migrations():
    """
    Executes safe DDL column additions on Neon PostgreSQL on application startup.

    WHAT IT DOES:
    Checks and adds `bio`, `password` to `users` table and `recipient_id` to `messages` table if missing.
    """
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Software Engineer & Team Collaborator';"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT 'password123';"))
            conn.execute(text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES users(id) ON DELETE CASCADE;"))
            conn.commit()
            print("Auto database migrations executed successfully.")
        except Exception as e:
            print(f"Auto migration notice: {e}")


def get_db():
    """FastAPI Dependency yielding a per-request database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

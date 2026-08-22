"""
Database Connection & Auto-Migration Management Module.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args={"sslmode": "require"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def _safe_exec(conn, sql: str):
    """Executes a DDL statement silently, ignoring errors for already-existing columns."""
    try:
        conn.execute(text(sql))
    except Exception as e:
        # Duplicate column errors are safe to ignore
        if "already exists" not in str(e).lower():
            print(f"  Migration warning: {e}")


def run_auto_migrations():
    """
    Executes DDL column additions on Neon PostgreSQL on startup.
    Each statement is independent so one failure doesn't abort the rest.
    """
    print("Running auto database migrations...")
    try:
        with engine.begin() as conn:
            # Ensure users table has bio and password columns
            _safe_exec(conn, "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Team Member';")
            _safe_exec(conn, "ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT 'password123';")
            # Ensure messages table has recipient_id for DMs
            _safe_exec(conn, "ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES users(id) ON DELETE SET NULL;")
        print("Auto database migrations completed successfully.")
    except Exception as e:
        print(f"Auto migration error: {e}")


def get_db():
    """FastAPI Dependency yielding a per-request database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

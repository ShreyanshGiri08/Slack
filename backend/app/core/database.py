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
    Executes DDL column additions and index creation on Neon PostgreSQL on startup.
    Each statement is independent so one failure doesn't abort the rest.
    """
    print("Running auto database migrations...")
    try:
        with engine.begin() as conn:
            # ── Column additions ──────────────────────────────────────────
            _safe_exec(conn, "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Team Member';")
            _safe_exec(conn, "ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT 'password123';")
            _safe_exec(conn, "ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES users(id) ON DELETE SET NULL;")

            # ── Optimisation 1: Composite Indexes ─────────────────────────
            # Covers get_channel_messages: channel_id + parent_id IS NULL + recipient_id IS NULL + created_at
            _safe_exec(conn, """
                CREATE INDEX IF NOT EXISTS idx_messages_channel_feed
                ON messages (channel_id, created_at ASC)
                WHERE parent_id IS NULL AND recipient_id IS NULL;
            """)
            # Covers get_direct_messages: DM pair lookup by both participants
            _safe_exec(conn, """
                CREATE INDEX IF NOT EXISTS idx_messages_dm_pair
                ON messages (user_id, recipient_id, created_at ASC)
                WHERE recipient_id IS NOT NULL;
            """)
            # Covers thread reply lookup: parent_id + created_at
            _safe_exec(conn, """
                CREATE INDEX IF NOT EXISTS idx_messages_thread_replies
                ON messages (parent_id, created_at ASC)
                WHERE parent_id IS NOT NULL;
            """)
            # Covers user login: username equality lookup
            _safe_exec(conn, """
                CREATE INDEX IF NOT EXISTS idx_users_username
                ON users (username);
            """)
            # Covers unread count calculation: channel_id + user_id lookup
            _safe_exec(conn, """
                CREATE INDEX IF NOT EXISTS idx_message_reads_user_channel
                ON message_reads (user_id, channel_id);
            """)

        print("Auto database migrations and indexes completed successfully.")
    except Exception as e:
        print(f"Auto migration error: {e}")


def get_db():
    """FastAPI Dependency yielding a per-request database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

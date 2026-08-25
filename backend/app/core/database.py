from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

db_url = settings.DATABASE_URL

# Normalize postgres:// to postgresql:// for SQLAlchemy 1.4+ compatibility (Render/Supabase/Neon)
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
engine_kwargs = {"echo": False}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # PostgreSQL production pool settings
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 15,
        "pool_timeout": 30,
        "pool_recycle": 1800,
    })

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def run_migrations(db):
    """
    Safe, idempotent schema column migrations for both PostgreSQL and SQLite.
    Guarantees newly added model columns are present before querying.
    """
    columns_to_ensure = [
        ("users", "is_vip", "BOOLEAN DEFAULT FALSE"),
        ("users", "vip_expires_at", "TIMESTAMP WITH TIME ZONE"),
        ("users", "avatar", "VARCHAR DEFAULT ''"),
        ("users", "is_active", "BOOLEAN DEFAULT TRUE"),
        ("users", "is_admin", "BOOLEAN DEFAULT FALSE"),
        ("users", "total_points", "INTEGER DEFAULT 0"),
        ("users", "total_predictions", "INTEGER DEFAULT 0"),
        ("users", "correct_results", "INTEGER DEFAULT 0"),
        ("users", "correct_scores", "INTEGER DEFAULT 0"),
        ("users", "accuracy", "FLOAT DEFAULT 0.0"),
    ]

    for table, column, col_type in columns_to_ensure:
        try:
            # PostgreSQL syntax
            db.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {col_type};"))
            db.commit()
        except Exception:
            db.rollback()
            try:
                # SQLite fallback syntax
                db.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type};"))
                db.commit()
            except Exception:
                db.rollback()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

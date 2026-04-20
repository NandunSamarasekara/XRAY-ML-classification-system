from .session import engine
from .base import Base  # noqa: F401 — ensures models are registered


def create_tables() -> None:
    """Create all database tables if they don't exist."""
    Base.metadata.create_all(bind=engine)

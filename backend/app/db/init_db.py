from app.db.session import Base, engine
from app.models import doctor, review  # noqa: F401 — ensures models are registered


def create_tables() -> None:
    """Create all database tables if they don't exist."""
    Base.metadata.create_all(bind=engine)

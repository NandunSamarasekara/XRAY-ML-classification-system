import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import settings
sys.path.append('c:\\Users\\ASUS\\PycharmProjects\\Wedakam\\backend')
from app.config import settings

def test_db():
    print(f"Connecting to: {settings.DATABASE_URL}")
    try:
        engine = create_engine(settings.DATABASE_URL)
        connection = engine.connect()
        print("Successfully connected to the database!")
        connection.close()
    except Exception as e:
        print(f"Database connection failed: {e}")

if __name__ == "__main__":
    test_db()

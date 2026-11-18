import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, UserSettings

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./codewaste.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    # Ensure default settings row exists
    db = SessionLocal()
    try:
        settings = db.query(UserSettings).filter(UserSettings.id == 1).first()
        if not settings:
            default_settings = UserSettings(id=1)
            db.add(default_settings)
            db.commit()
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

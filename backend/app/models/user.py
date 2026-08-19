from sqlalchemy import Column, String, DateTime, JSON, Integer
from datetime import datetime
import uuid
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, default="Alex Mercer")
    email = Column(String, nullable=False, default="candidate@example.com")
    target_role = Column(String, nullable=True, default="Full Stack Developer")
    experience_level = Column(String, nullable=True, default="Intermediate")
    streak_count = Column(Integer, default=1)
    last_active_date = Column(String, default=lambda: datetime.now().strftime('%Y-%m-%d'))
    settings = Column(JSON, default=lambda: {
        "theme": "dark",
        "voice_enabled": True,
        "default_difficulty": "Intermediate",
        "default_hr_percentage": 20,
        "default_question_count": 5,
        "mode": "real"
    })
    created_at = Column(DateTime, default=datetime.utcnow)

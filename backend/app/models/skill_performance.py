from sqlalchemy import Column, String, DateTime, JSON, Integer, Float, ForeignKey
from datetime import datetime
import uuid
from app.database import Base

class SkillPerformance(Base):
    __tablename__ = "skill_performances"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String, nullable=False) # e.g. 'Python', 'SQL JOINs', 'System Design'
    category = Column(String, default="Technical") # 'Technical', 'HR', 'Problem Solving'
    
    current_score = Column(Float, default=70.0)
    attempt_count = Column(Integer, default=1)
    score_history = Column(JSON, default=list) # [{ date, score, interview_id }]
    trend = Column(String, default="improving") # 'improving', 'declining', 'stable'
    weakness_level = Column(String, default="normal") # 'weak', 'moderate', 'strong'
    last_tested_date = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

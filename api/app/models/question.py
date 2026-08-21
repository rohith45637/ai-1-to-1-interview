from sqlalchemy import Column, String, DateTime, Integer, Boolean, ForeignKey
from datetime import datetime
import uuid
from app.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id = Column(String, ForeignKey("interviews.id"), nullable=False)
    
    question_number = Column(Integer, nullable=False)
    question_text = Column(String, nullable=False)
    category = Column(String, nullable=False) # 'Technical', 'HR', 'Scenario', 'Resume', 'Problem Solving'
    target_skill = Column(String, nullable=False) # e.g. 'Python', 'SQL JOINs', 'Conflict Resolution'
    difficulty = Column(String, nullable=False) # 'Beginner', 'Intermediate', 'Advanced', 'Expert'
    
    is_follow_up = Column(Boolean, default=False)
    parent_question_id = Column(String, nullable=True)
    
    context_note = Column(String, nullable=True) # rationale or evaluation criteria
    created_at = Column(DateTime, default=datetime.utcnow)

from sqlalchemy import Column, String, DateTime, JSON, Float, ForeignKey
from datetime import datetime
import uuid
from app.database import Base

class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = Column(String, ForeignKey("questions.id"), nullable=False)
    interview_id = Column(String, ForeignKey("interviews.id"), nullable=False)
    
    user_answer = Column(String, nullable=False)
    
    # Detailed Rubric Scores
    overall_score = Column(Float, default=0.0)
    correctness_score = Column(Float, default=0.0)
    technical_depth_score = Column(Float, default=0.0)
    relevance_score = Column(Float, default=0.0)
    completeness_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)

    # Detailed Analysis Fields
    strong_points = Column(JSON, default=list)
    missing_points = Column(JSON, default=list)
    incorrect_points = Column(JSON, default=list)
    
    # Communication Analysis
    communication_feedback = Column(JSON, default=dict)
    # e.g.: { clarity: 'high', structure_used: 'STAR', filler_words_detected: [], suggestion: '...' }

    improvement_suggestion = Column(String, nullable=True)
    ideal_answer = Column(String, nullable=True)
    recommended_practice = Column(String, nullable=True)

    # Follow-up Decision
    requires_follow_up = Column(String, default="false")
    follow_up_reason = Column(String, nullable=True)

    answered_at = Column(DateTime, default=datetime.utcnow)

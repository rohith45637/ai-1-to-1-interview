from sqlalchemy import Column, String, DateTime, JSON, Integer, Float, ForeignKey
from datetime import datetime
import uuid
from app.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=True)
    
    job_role = Column(String, nullable=False)
    interview_type = Column(String, nullable=False) # 'Technical', 'HR', 'Mixed', 'Resume-Based', 'Role-Based', 'Weak-Skill Practice', 'Final Mock'
    difficulty = Column(String, nullable=False) # 'Beginner', 'Intermediate', 'Advanced', 'Expert'
    hr_percentage = Column(Integer, default=20)
    total_questions = Column(Integer, default=5)
    duration_minutes = Column(Integer, default=15)
    mode = Column(String, default="real") # 'real' or 'practice'
    
    status = Column(String, default="in_progress") # 'in_progress', 'completed', 'abandoned'
    current_question_index = Column(Integer, default=0)

    # Score Metrics
    overall_score = Column(Float, default=0.0)
    category_scores = Column(JSON, default=lambda: {
        "technical_knowledge": 0.0,
        "problem_solving": 0.0,
        "communication": 0.0,
        "hr_performance": 0.0,
        "resume_knowledge": 0.0,
        "role_knowledge": 0.0
    })
    
    skill_scores = Column(JSON, default=dict)
    weak_areas = Column(JSON, default=list)
    strong_areas = Column(JSON, default=list)
    communication_summary = Column(JSON, default=dict)
    presentation_metrics = Column(JSON, default=dict)
    improvement_plan = Column(JSON, default=list)
    recommended_next_interview = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
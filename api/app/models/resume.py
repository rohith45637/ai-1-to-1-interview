from sqlalchemy import Column, String, DateTime, JSON, Integer, Float, ForeignKey
from datetime import datetime
import uuid
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    version_number = Column(Integer, default=1)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    raw_text = Column(String, nullable=False)
    
    # Structured Extracted Data
    parsed_data = Column(JSON, default=dict)
    # e.g.: {
    #   name, email, phone, education, skills: [], programming_languages: [],
    #   tools: [], certifications: [], internships: [], projects: [], experience: [],
    #   roles: [], technologies: []
    # }

    # ATS Scoring Data
    ats_score = Column(Float, default=0.0)
    ats_breakdown = Column(JSON, default=dict)
    # e.g.: { structure_score, keyword_score, experience_score, formatting_score, ... }

    # Multi-Role Compatibility Match
    role_matches = Column(JSON, default=list)
    # e.g.: [{ role: 'Full Stack', match_percentage: 84, matching_skills: [], missing_skills: [] }]

    uploaded_at = Column(DateTime, default=datetime.utcnow)

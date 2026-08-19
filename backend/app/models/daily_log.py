from sqlalchemy import Column, String, Date, JSON, Integer, Float, ForeignKey
from datetime import date
import uuid
from app.database import Base

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    log_date = Column(String, nullable=False) # 'YYYY-MM-DD'
    
    interview_count = Column(Integer, default=1)
    average_score = Column(Float, default=0.0)
    technical_score = Column(Float, default=0.0)
    hr_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    weak_topics = Column(JSON, default=list)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserSettings
from app.config import settings
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Auth & User Profile"])

def get_or_create_default_user(db: Session) -> User:
    user = db.query(User).filter(User.id == settings.DEFAULT_USER_ID).first()
    if not user:
        user = User(
            id=settings.DEFAULT_USER_ID,
            name="Alex Mercer",
            email="candidate@example.com",
            target_role="Full Stack Developer",
            experience_level="Intermediate",
            streak_count=0,
            last_active_date=None,
            settings={
                "theme": "dark",
                "voice_enabled": True,
                "default_difficulty": "Intermediate",
                "default_hr_percentage": 20,
                "default_question_count": 5,
                "mode": "real"
            }
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("/profile", response_model=UserResponse)
def get_profile(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    
    # Check streak freshness
    if user.last_active_date:
        try:
            last_dt = datetime.strptime(user.last_active_date, '%Y-%m-%d').date()
            today_dt = datetime.now().date()
            days_diff = (today_dt - last_dt).days
            if days_diff > 1 and (user.streak_count or 0) > 0:
                user.streak_count = 0
                db.commit()
                db.refresh(user)
        except Exception:
            pass
        
    return user

@router.put("/profile", response_model=UserResponse)
def update_profile(update_data: UserUpdate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    if update_data.name is not None:
        user.name = update_data.name
    if update_data.email is not None:
        user.email = update_data.email
    if update_data.target_role is not None:
        user.target_role = update_data.target_role
    if update_data.experience_level is not None:
        user.experience_level = update_data.experience_level
    if update_data.settings is not None:
        current_settings = dict(user.settings or {})
        current_settings.update(update_data.settings)
        user.settings = current_settings

    db.commit()
    db.refresh(user)
    return user

@router.post("/reset-data")
def reset_user_data(db: Session = Depends(get_db)):
    from app.models.interview import Interview
    from app.models.question import Question
    from app.models.answer import Answer
    from app.models.skill_performance import SkillPerformance
    from app.models.daily_log import DailyLog
    
    user = get_or_create_default_user(db)
    
    # Delete dependent answers and questions
    interviews = db.query(Interview).filter(Interview.user_id == user.id).all()
    for intv in interviews:
        db.query(Answer).filter(Answer.interview_id == intv.id).delete()
        db.query(Question).filter(Question.interview_id == intv.id).delete()
    
    db.query(Interview).filter(Interview.user_id == user.id).delete()
    db.query(SkillPerformance).filter(SkillPerformance.user_id == user.id).delete()
    db.query(DailyLog).filter(DailyLog.user_id == user.id).delete()
    
    user.streak_count = 0
    user.last_active_date = None

    db.commit()
    return {"status": "success", "message": "User interview and skill data has been reset."}

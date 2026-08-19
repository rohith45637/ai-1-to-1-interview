from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models.skill_performance import SkillPerformance
from app.schemas.analytics import SkillScoreItem
from app.routes.auth import get_or_create_default_user

router = APIRouter(prefix="/api/skills", tags=["Skill Matrix & Weak Areas"])

@router.get("", response_model=List[SkillScoreItem])
def get_user_skills(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    skills = db.query(SkillPerformance).filter(SkillPerformance.user_id == user.id).order_by(SkillPerformance.current_score.asc()).all()
    
    if not skills:
        sample_skills = [
            ("Python Fundamentals", "Technical", 82.0, 4, "improving", "strong"),
            ("SQL JOINs & Indexing", "Technical", 54.0, 3, "declining", "weak"),
            ("React State Architecture", "Technical", 76.0, 3, "improving", "moderate"),
            ("REST API Design & Auth", "Technical", 68.0, 2, "stable", "weak"),
            ("Communication & STAR Delivery", "HR", 78.0, 4, "improving", "moderate"),
            ("System Scalability & Caching", "Technical", 62.0, 2, "improving", "weak")
        ]
        for name, cat, score, count, trend, w_level in sample_skills:
            sp = SkillPerformance(
                user_id=user.id,
                skill_name=name,
                category=cat,
                current_score=score,
                attempt_count=count,
                trend=trend,
                weakness_level=w_level
            )
            db.add(sp)
        db.commit()
        skills = db.query(SkillPerformance).filter(SkillPerformance.user_id == user.id).order_by(SkillPerformance.current_score.asc()).all()

    return [
        SkillScoreItem(
            skill_name=s.skill_name,
            category=s.category,
            current_score=s.current_score,
            attempt_count=s.attempt_count,
            trend=s.trend,
            weakness_level=s.weakness_level
        )
        for s in skills
    ]

@router.get("/weak-areas", response_model=List[SkillScoreItem])
def get_weak_areas(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    all_skills = db.query(SkillPerformance).filter(SkillPerformance.user_id == user.id).all()
    if not all_skills:
        get_user_skills(db)
        all_skills = db.query(SkillPerformance).filter(SkillPerformance.user_id == user.id).all()

    weak = [s for s in all_skills if s.current_score < 72.0]
    return [
        SkillScoreItem(
            skill_name=s.skill_name,
            category=s.category,
            current_score=s.current_score,
            attempt_count=s.attempt_count,
            trend=s.trend,
            weakness_level=s.weakness_level
        )
        for s in sorted(weak, key=lambda x: x.current_score)
    ]

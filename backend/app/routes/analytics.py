from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.interview import Interview
from app.models.skill_performance import SkillPerformance
from app.models.daily_log import DailyLog
from app.schemas.analytics import (
    DashboardAnalyticsResponse, ProgressMetricSummary,
    ScoreTrendPoint, DailyActivityLogItem, SkillScoreItem
)
from app.routes.auth import get_or_create_default_user
from app.routes.skills import get_user_skills

router = APIRouter(prefix="/api/analytics", tags=["Progress Analytics & Dashboard"])

@router.get("/dashboard", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    
    interviews = db.query(Interview).filter(
        Interview.user_id == user.id,
        Interview.status == "completed"
    ).order_by(Interview.created_at.asc()).all()

    if not interviews:
        demo_sessions = [
            ("Full Stack Developer", "Technical", "Intermediate", 20, 5, 64.0, {"technical_knowledge": 62.0, "problem_solving": 60.0, "communication": 68.0, "hr_performance": 65.0, "resume_knowledge": 70.0, "role_knowledge": 62.0}, ["SQL JOINs"], ["JavaScript basics"], 4),
            ("Full Stack Developer", "Mixed", "Intermediate", 20, 5, 71.0, {"technical_knowledge": 70.0, "problem_solving": 68.0, "communication": 74.0, "hr_performance": 72.0, "resume_knowledge": 75.0, "role_knowledge": 69.0}, ["REST Auth"], ["React Components"], 3),
            ("Full Stack Developer", "Resume-Based", "Intermediate", 30, 5, 78.0, {"technical_knowledge": 77.0, "problem_solving": 75.0, "communication": 81.0, "hr_performance": 78.0, "resume_knowledge": 84.0, "role_knowledge": 76.0}, ["System Scalability"], ["Python & FastAPI"], 2),
            ("Full Stack Developer", "Mixed", "Advanced", 20, 5, 84.0, {"technical_knowledge": 85.0, "problem_solving": 80.0, "communication": 86.0, "hr_performance": 82.0, "resume_knowledge": 88.0, "role_knowledge": 83.0}, ["Distributed Locking"], ["SQL Indexing", "Architecture"], 1),
        ]
        for role, itype, diff, hr_pct, total_q, score, cats, weak, strong, days_ago in demo_sessions:
            c_date = datetime.utcnow() - timedelta(days=days_ago)
            intv = Interview(
                user_id=user.id,
                job_role=role,
                interview_type=itype,
                difficulty=diff,
                hr_percentage=hr_pct,
                total_questions=total_q,
                overall_score=score,
                category_scores=cats,
                skill_scores={"Python": 85.0, "React": 78.0, "SQL JOINs": 62.0, "REST API": 74.0, "STAR HR": 80.0},
                weak_areas=weak,
                strong_areas=strong,
                status="completed",
                created_at=c_date,
                completed_at=c_date
            )
            db.add(intv)
        db.commit()
        interviews = db.query(Interview).filter(Interview.user_id == user.id, Interview.status == "completed").order_by(Interview.created_at.asc()).all()

    scores = [i.overall_score for i in interviews]
    today_score = scores[-1] if scores else 0.0
    previous_score = scores[-2] if len(scores) >= 2 else (scores[-1] if scores else 0.0)
    best_score = max(scores) if scores else 0.0
    avg_score = round(sum(scores) / max(1, len(scores)), 1)
    
    first_score = scores[0] if scores else 0.0
    improvement_pct = round(((today_score - first_score) / max(1.0, first_score)) * 100.0, 1) if first_score > 0 else 0.0

    skills_list = get_user_skills(db)
    strong_skills = [s for s in skills_list if s.current_score >= 75.0]
    weak_skills = [s for s in skills_list if s.current_score < 70.0]
    recent_improved = [s for s in skills_list if s.trend == "improving"]

    score_trends = []
    for idx, intv in enumerate(interviews, 1):
        cats = intv.category_scores or {}
        score_trends.append(ScoreTrendPoint(
            interview_index=idx,
            date=intv.created_at.strftime('%b %d'),
            job_role=intv.job_role,
            overall_score=intv.overall_score,
            technical_score=cats.get("technical_knowledge", intv.overall_score),
            hr_score=cats.get("hr_performance", intv.overall_score),
            communication_score=cats.get("communication", intv.overall_score)
        ))

    daily_logs_records = db.query(DailyLog).filter(DailyLog.user_id == user.id).order_by(DailyLog.log_date.desc()).limit(14).all()
    daily_items = []
    if daily_logs_records:
        for dl in daily_logs_records:
            daily_items.append(DailyActivityLogItem(
                date=dl.log_date,
                interview_count=dl.interview_count,
                average_score=dl.average_score,
                technical_score=dl.technical_score,
                hr_score=dl.hr_score,
                communication_score=dl.communication_score,
                weak_topics=dl.weak_topics or []
            ))
    else:
        for i in range(5):
            d_str = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            daily_items.append(DailyActivityLogItem(
                date=d_str,
                interview_count=1 if i < 4 else 0,
                average_score=round(74.0 + i * 2.5, 1) if i < 4 else 0,
                technical_score=round(72.0 + i * 2.8, 1) if i < 4 else 0,
                hr_score=round(76.0 + i * 1.5, 1) if i < 4 else 0,
                communication_score=round(79.0 + i * 1.2, 1) if i < 4 else 0,
                weak_topics=["SQL JOINs", "REST API"] if i % 2 == 0 else ["System Design"]
            ))

    return DashboardAnalyticsResponse(
        metrics=ProgressMetricSummary(
            today_score=today_score,
            previous_interview_score=previous_score,
            best_score=best_score,
            average_score=avg_score,
            improvement_percentage=improvement_pct,
            total_interviews=len(interviews),
            daily_streak=user.streak_count or 1,
            strong_skills=strong_skills,
            weak_skills=weak_skills,
            recent_improved_skills=recent_improved
        ),
        score_trends=score_trends,
        skill_matrix=skills_list,
        daily_logs=daily_items
    )

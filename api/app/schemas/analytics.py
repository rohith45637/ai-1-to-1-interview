from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import date, datetime

class SkillScoreItem(BaseModel):
    skill_name: str
    category: str
    current_score: float
    attempt_count: int
    trend: str # 'improving', 'declining', 'stable'
    weakness_level: str # 'weak', 'moderate', 'strong'

class ProgressMetricSummary(BaseModel):
    today_score: float
    previous_interview_score: float
    best_score: float
    average_score: float
    improvement_percentage: float
    total_interviews: int
    daily_streak: int
    strong_skills: List[SkillScoreItem]
    weak_skills: List[SkillScoreItem]
    recent_improved_skills: List[SkillScoreItem]

class ScoreTrendPoint(BaseModel):
    interview_index: int
    date: str
    job_role: str
    overall_score: float
    technical_score: float
    hr_score: float
    communication_score: float

class DailyActivityLogItem(BaseModel):
    date: str
    interview_count: int
    average_score: float
    technical_score: float
    hr_score: float
    communication_score: float
    weak_topics: List[str]

class DashboardAnalyticsResponse(BaseModel):
    metrics: ProgressMetricSummary
    score_trends: List[ScoreTrendPoint]
    skill_matrix: List[SkillScoreItem]
    daily_logs: List[DailyActivityLogItem]

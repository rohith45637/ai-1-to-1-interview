from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class InterviewCreateRequest(BaseModel):
    job_role: str
    interview_type: str = "Mixed" # 'Technical', 'HR', 'Mixed', 'Resume-Based', 'Role-Based', 'Weak-Skill Practice', 'Final Mock'
    difficulty: str = "Intermediate" # 'Beginner', 'Intermediate', 'Advanced', 'Expert'
    hr_percentage: int = Field(default=20, ge=0, le=100)
    total_questions: int = Field(default=5, ge=1, le=20)
    duration_minutes: int = Field(default=15, ge=5, le=45)
    mode: str = "real" # 'real' or 'practice'
    resume_id: Optional[str] = None
    target_weak_skills: Optional[List[str]] = None

class AnswerSubmissionRequest(BaseModel):
    interview_id: str
    question_id: str
    user_answer: str
    answer_duration_seconds: Optional[int] = None
    presentation_metrics: Optional[Dict[str, Any]] = None

class CommunicationFeedback(BaseModel):
    clarity_level: str # 'High', 'Moderate', 'Needs Work'
    structure_framework: str # e.g. 'STAR', 'Definition-Explanation-Example', 'Unstructured'
    filler_words_detected: List[str] = []
    conciseness_score: int
    vocabulary_and_tone: str
    actionable_suggestion: str

class AnswerEvaluationResponse(BaseModel):
    answer_id: str
    question_id: str
    overall_score: float
    correctness_score: float
    technical_depth_score: float
    relevance_score: float
    completeness_score: float
    communication_score: float
    strong_points: List[str]
    missing_points: List[str]
    incorrect_points: List[str]
    communication_feedback: CommunicationFeedback
    improvement_suggestion: str
    ideal_answer: str
    recommended_practice: str
    requires_follow_up: bool
    follow_up_reason: Optional[str] = None

class QuestionResponse(BaseModel):
    id: str
    interview_id: str
    question_number: int
    total_questions: int
    question_text: str
    category: str
    target_skill: str
    difficulty: str
    is_follow_up: bool
    parent_question_id: Optional[str] = None
    mode: str
    # If practice mode and previously answered, include answer evaluation
    previous_evaluation: Optional[AnswerEvaluationResponse] = None

class InterviewCategoryScores(BaseModel):
    technical_knowledge: float
    problem_solving: float
    communication: float
    hr_performance: float
    resume_knowledge: float
    role_knowledge: float

class InterviewDetailItem(BaseModel):
    question_number: int
    question_text: str
    category: str
    target_skill: str
    difficulty: str
    is_follow_up: bool
    user_answer: Optional[str] = None
    evaluation: Optional[AnswerEvaluationResponse] = None

class PresentationAnalysisMetrics(BaseModel):
    camera_presence: float = 85.0
    posture: str = "Good" # 'Excellent', 'Good', 'Needs Improvement'
    camera_attention: str = "Good" # 'Good', 'Moderate', 'Needs Improvement'
    movement: str = "Stable" # 'Stable', 'Good', 'Excessive'
    overall_presentation_score: float = 82.0
    recommendations: List[str] = []
    is_available: bool = True

class InterviewReportResponse(BaseModel):
    id: str
    job_role: str
    interview_type: str
    difficulty: str
    hr_percentage: int
    total_questions: int
    mode: str
    status: str
    overall_score: float
    category_scores: InterviewCategoryScores
    skill_scores: Dict[str, float]
    weak_areas: List[str]
    strong_areas: List[str]
    communication_summary: Dict[str, Any]
    presentation_analysis: Optional[PresentationAnalysisMetrics] = None
    improvement_plan: List[str]
    recommended_next_interview: Dict[str, Any]
    items: List[InterviewDetailItem]
    created_at: datetime
    completed_at: Optional[datetime] = None

class InterviewHistorySummary(BaseModel):
    id: str
    job_role: str
    interview_type: str
    difficulty: str
    hr_percentage: int
    total_questions: int
    mode: str
    status: str
    overall_score: float
    presentation_score: Optional[float] = None
    weak_areas: List[str]
    strong_areas: List[str]
    created_at: datetime
    completed_at: Optional[datetime] = None
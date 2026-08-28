from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime

class CandidateProfile(BaseModel):
    name: Optional[str] = "Candidate"
    email: Optional[str] = None
    phone: Optional[str] = None
    education: List[Dict[str, Any]] = []
    skills: List[str] = []
    programming_languages: List[str] = []
    tools: List[str] = []
    certifications: List[str] = []
    internships: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    job_roles: List[str] = []
    technologies: List[str] = []

class RoleMatchResult(BaseModel):
    role_id: str
    role_title: str
    match_percentage: int
    matching_skills: List[str]
    missing_skills: List[str]
    readiness_summary: str
    preparation_tips: List[str]

class AtsSectionScore(BaseModel):
    score: int
    max_score: int
    status: str # 'excellent', 'good', 'needs_improvement', 'critical'
    feedback: str

class AtsBreakdown(BaseModel):
    structure_score: AtsSectionScore
    skills_score: AtsSectionScore
    experience_score: AtsSectionScore
    formatting_score: AtsSectionScore
    action_verbs_score: AtsSectionScore
    quantifiable_metrics_score: AtsSectionScore
    missing_keywords: List[str]
    strengths: List[str]
    critical_fixes: List[str]
    recommended_improvements: List[str]

class ResumeUploadResponse(BaseModel):
    id: str
    user_id: str
    version_number: int
    file_name: str
    parsed_data: CandidateProfile
    ats_score: float
    ats_breakdown: AtsBreakdown
    role_matches: List[RoleMatchResult]
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResumeVersionSummary(BaseModel):
    id: str
    version_number: int
    file_name: str
    ats_score: float
    uploaded_at: datetime
    skills_count: int

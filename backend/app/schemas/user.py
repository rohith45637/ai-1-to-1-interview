from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

class UserSettings(BaseModel):
    theme: str = "dark"
    voice_enabled: bool = True
    default_difficulty: str = "Intermediate"
    default_hr_percentage: int = 20
    default_question_count: int = 5
    mode: str = "real"

class UserBase(BaseModel):
    name: str = "Alex Mercer"
    email: str = "candidate@example.com"
    target_role: Optional[str] = "Full Stack Developer"
    experience_level: Optional[str] = "Intermediate"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class UserResponse(UserBase):
    id: str
    streak_count: int
    last_active_date: str
    settings: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

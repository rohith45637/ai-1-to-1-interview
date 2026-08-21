from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeUploadResponse, ResumeVersionSummary
from app.services.resume_parser import ResumeParser
from app.services.ats_analyzer import AtsAnalyzer
from app.routes.auth import get_or_create_default_user

router = APIRouter(prefix="/api/resumes", tags=["Resumes & ATS"])

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    user = get_or_create_default_user(db)
    
    # Read file content
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    filename = file.filename or "resume.pdf"
    ext = filename.lower().split(".")[-1]
    if ext not in ["pdf", "doc", "docx", "txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or DOC.")

    # Extract text
    raw_text = ResumeParser.extract_text(filename, contents)
    if not raw_text or len(raw_text.strip()) < 15:
        raise HTTPException(status_code=400, detail="Could not extract text from document. Ensure file is not password-protected or scanned image.")

    # AI Parsed Candidate Profile
    parsed_data = await ResumeParser.parse_resume(raw_text)

    # ATS Scoring and Multi-Role Compatibility
    ats_result = await AtsAnalyzer.analyze_ats(raw_text, parsed_data)
    
    # Calculate next version number for this user
    existing_resumes = db.query(Resume).filter(Resume.user_id == user.id).all()
    version_number = len(existing_resumes) + 1

    # Save to database
    resume = Resume(
        user_id=user.id,
        version_number=version_number,
        file_name=filename,
        file_type=ext,
        raw_text=raw_text,
        parsed_data=parsed_data,
        ats_score=ats_result.get("ats_score", 80.0),
        ats_breakdown=ats_result.get("ats_breakdown", {}),
        role_matches=ats_result.get("role_matches", [])
    )
    db.add(resume)
    
    # Update user profile target role if candidate provided
    if target_role:
        user.target_role = target_role
    elif parsed_data.get("job_roles"):
        user.target_role = parsed_data["job_roles"][0]

    db.commit()
    db.refresh(resume)

    return resume

@router.get("/versions", response_model=List[ResumeVersionSummary])
def get_resume_versions(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    resumes = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.version_number.desc()).all()
    
    summaries = []
    for r in resumes:
        skills = r.parsed_data.get("skills", []) if r.parsed_data else []
        summaries.append({
            "id": r.id,
            "version_number": r.version_number,
            "file_name": r.file_name,
            "ats_score": r.ats_score,
            "uploaded_at": r.uploaded_at,
            "skills_count": len(skills)
        })
    return summaries

@router.get("/latest", response_model=ResumeUploadResponse)
def get_latest_resume(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    resume = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.version_number.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume uploaded yet")
    return resume

@router.get("/{resume_id}", response_model=ResumeUploadResponse)
def get_resume_by_id(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

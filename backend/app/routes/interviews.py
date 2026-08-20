from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.interview import Interview
from app.models.question import Question
from app.models.answer import Answer
from app.models.skill_performance import SkillPerformance
from app.models.daily_log import DailyLog
from app.schemas.interview import (
    InterviewCreateRequest, AnswerSubmissionRequest, QuestionResponse,
    AnswerEvaluationResponse, InterviewReportResponse, InterviewHistorySummary,
    InterviewDetailItem, InterviewCategoryScores, CommunicationFeedback
)
from app.services.adaptive_engine import AdaptiveEngine
from app.services.scoring_service import ScoringService
from app.routes.auth import get_or_create_default_user

router = APIRouter(prefix="/api/interviews", tags=["Interview Engine"])

@router.post("/create", response_model=QuestionResponse)
async def create_interview(request: InterviewCreateRequest, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    
    resume_summary = ""
    resume_skills = []
    if request.resume_id:
        resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
        if resume and resume.parsed_data:
            skills = resume.parsed_data.get("skills", [])
            resume_skills = skills
            resume_summary = f"Skills: {', '.join(skills[:8])}. Projects: {len(resume.parsed_data.get('projects', []))}."
    else:
        latest_res = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.version_number.desc()).first()
        if latest_res and latest_res.parsed_data:
            resume_skills = latest_res.parsed_data.get("skills", [])
            resume_summary = f"Skills: {', '.join(resume_skills[:8])}."

    weak_records = db.query(SkillPerformance).filter(
        SkillPerformance.user_id == user.id,
        SkillPerformance.current_score < 70.0
    ).all()
    weak_skills = [w.skill_name for w in weak_records]
    if request.target_weak_skills:
        weak_skills.extend(request.target_weak_skills)

    categories = AdaptiveEngine.calculate_question_distribution(
        request.total_questions,
        request.hr_percentage,
        request.interview_type
    )

    first_category = categories[0] if categories else "Technical"
    first_skill = AdaptiveEngine.select_target_skill(
        job_role=request.job_role,
        category=first_category,
        weak_skills=weak_skills,
        resume_skills=resume_skills,
        tested_skills=[]
    )

    interview = Interview(
        user_id=user.id,
        resume_id=request.resume_id,
        job_role=request.job_role,
        interview_type=request.interview_type,
        difficulty=request.difficulty,
        hr_percentage=request.hr_percentage,
        total_questions=request.total_questions,
        duration_minutes=request.duration_minutes,
        mode=request.mode,
        status="in_progress",
        current_question_index=1
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    q_data = await AdaptiveEngine.generate_next_question(
        job_role=request.job_role,
        interview_type=request.interview_type,
        difficulty=request.difficulty,
        question_number=1,
        total_questions=request.total_questions,
        category=first_category,
        target_skill=first_skill,
        resume_summary=resume_summary,
        weak_skills=weak_skills,
        previous_questions=[]
    )

    question = Question(
        interview_id=interview.id,
        question_number=1,
        question_text=q_data.get("question_text", f"Can you explain the core concepts and trade-offs of {first_skill} in {request.job_role}?"),
        category=first_category,
        target_skill=first_skill,
        difficulty=request.difficulty,
        is_follow_up=False,
        context_note=q_data.get("context_note", "")
    )
    db.add(question)
    db.commit()
    db.refresh(question)

    return QuestionResponse(
        id=question.id,
        interview_id=interview.id,
        question_number=1,
        total_questions=interview.total_questions,
        question_text=question.question_text,
        category=question.category,
        target_skill=question.target_skill,
        difficulty=question.difficulty,
        is_follow_up=False,
        parent_question_id=None,
        mode=interview.mode,
        previous_evaluation=None
    )

@router.post("/answer")
async def submit_answer(submission: AnswerSubmissionRequest, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == submission.interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    question = db.query(Question).filter(Question.id == submission.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    eval_result = await ScoringService.evaluate_answer(
        question_text=question.question_text,
        category=question.category,
        target_skill=question.target_skill,
        job_role=interview.job_role,
        difficulty=interview.difficulty,
        user_answer=submission.user_answer
    )

    answer = Answer(
        question_id=question.id,
        interview_id=interview.id,
        user_answer=submission.user_answer,
        overall_score=eval_result.get("overall_score", 70.0),
        correctness_score=eval_result.get("correctness_score", 70.0),
        technical_depth_score=eval_result.get("technical_depth_score", 70.0),
        relevance_score=eval_result.get("relevance_score", 70.0),
        completeness_score=eval_result.get("completeness_score", 70.0),
        communication_score=eval_result.get("communication_score", 70.0),
        strong_points=eval_result.get("strong_points", []),
        missing_points=eval_result.get("missing_points", []),
        incorrect_points=eval_result.get("incorrect_points", []),
        communication_feedback=eval_result.get("communication_feedback", {}),
        improvement_suggestion=eval_result.get("improvement_suggestion", ""),
        ideal_answer=eval_result.get("ideal_answer", ""),
        recommended_practice=eval_result.get("recommended_practice", ""),
        requires_follow_up=str(eval_result.get("requires_follow_up", False)),
        follow_up_reason=eval_result.get("follow_up_reason", None)
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)

    comm_raw = eval_result.get("communication_feedback", {})
    comm_feedback = CommunicationFeedback(
        clarity_level=comm_raw.get("clarity_level", "High"),
        structure_framework=comm_raw.get("structure_framework", "Definition -> Explanation"),
        filler_words_detected=comm_raw.get("filler_words_detected", []),
        conciseness_score=comm_raw.get("conciseness_score", 80),
        vocabulary_and_tone=comm_raw.get("vocabulary_and_tone", "Professional"),
        actionable_suggestion=comm_raw.get("actionable_suggestion", "")
    )

    evaluation_dto = AnswerEvaluationResponse(
        answer_id=answer.id,
        question_id=question.id,
        overall_score=answer.overall_score,
        correctness_score=answer.correctness_score,
        technical_depth_score=answer.technical_depth_score,
        relevance_score=answer.relevance_score,
        completeness_score=answer.completeness_score,
        communication_score=answer.communication_score,
        strong_points=answer.strong_points or [],
        missing_points=answer.missing_points or [],
        incorrect_points=answer.incorrect_points or [],
        communication_feedback=comm_feedback,
        improvement_suggestion=answer.improvement_suggestion or "",
        ideal_answer=answer.ideal_answer or "",
        recommended_practice=answer.recommended_practice or "",
        requires_follow_up=eval_result.get("requires_follow_up", False),
        follow_up_reason=eval_result.get("follow_up_reason", None)
    )

    current_q_count = db.query(Question).filter(Question.interview_id == interview.id).count()
    
    if eval_result.get("requires_follow_up") and not question.is_follow_up and current_q_count < interview.total_questions:
        fu_data = await AdaptiveEngine.generate_follow_up_question(
            original_question=question.question_text,
            user_answer=submission.user_answer,
            job_role=interview.job_role,
            target_skill=question.target_skill,
            difficulty=interview.difficulty
        )
        
        next_q_num = current_q_count + 1
        fu_question = Question(
            interview_id=interview.id,
            question_number=next_q_num,
            question_text=fu_data.get("question_text", f"Can you elaborate on how you would handle performance and failure modes in {question.target_skill}?"),
            category="Technical",
            target_skill=question.target_skill,
            difficulty=interview.difficulty,
            is_follow_up=True,
            parent_question_id=question.id,
            context_note=fu_data.get("context_note", "Follow-up question")
        )
        db.add(fu_question)
        interview.current_question_index = next_q_num
        db.commit()
        db.refresh(fu_question)

        return {
            "status": "next_question",
            "is_completed": False,
            "evaluation": evaluation_dto if interview.mode == "practice" else None,
            "next_question": QuestionResponse(
                id=fu_question.id,
                interview_id=interview.id,
                question_number=fu_question.question_number,
                total_questions=interview.total_questions,
                question_text=fu_question.question_text,
                category=fu_question.category,
                target_skill=fu_question.target_skill,
                difficulty=fu_question.difficulty,
                is_follow_up=True,
                parent_question_id=fu_question.parent_question_id,
                mode=interview.mode,
                previous_evaluation=evaluation_dto if interview.mode == "practice" else None
            )
        }

    # Save presentation metrics if provided by client webcam analysis
    if submission.presentation_metrics:
        interview.presentation_metrics = submission.presentation_metrics
        db.add(interview)
        db.commit()

    if current_q_count >= interview.total_questions:
        interview.status = "completed"
        interview.completed_at = datetime.utcnow()
        
        all_questions = db.query(Question).filter(Question.interview_id == interview.id).order_by(Question.question_number.asc()).all()
        qa_history = []
        for q in all_questions:
            ans = db.query(Answer).filter(Answer.question_id == q.id).first()
            if ans:
                qa_history.append({
                    "question_text": q.question_text,
                    "category": q.category,
                    "target_skill": q.target_skill,
                    "user_answer": ans.user_answer,
                    "evaluation": {
                        "overall_score": ans.overall_score,
                        "correctness_score": ans.correctness_score,
                        "technical_depth_score": ans.technical_depth_score,
                        "relevance_score": ans.relevance_score,
                        "completeness_score": ans.completeness_score,
                        "communication_score": ans.communication_score
                    }
                })

        report_data = await ScoringService.generate_interview_report(
            job_role=interview.job_role,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            qa_history=qa_history
        )

        interview.overall_score = report_data.get("overall_score", 75.0)
        interview.category_scores = report_data.get("category_scores", {})
        interview.skill_scores = report_data.get("skill_scores", {})
        interview.weak_areas = report_data.get("weak_areas", [])
        interview.strong_areas = report_data.get("strong_areas", [])
        interview.communication_summary = report_data.get("communication_summary", {})
        interview.improvement_plan = report_data.get("improvement_plan", [])
        interview.recommended_next_interview = report_data.get("recommended_next_interview", {})
        
        for skill_name, s_score in interview.skill_scores.items():
            existing_skill = db.query(SkillPerformance).filter(
                SkillPerformance.user_id == interview.user_id,
                SkillPerformance.skill_name == skill_name
            ).first()
            
            if existing_skill:
                hist = list(existing_skill.score_history or [])
                hist.append({"date": datetime.now().strftime('%Y-%m-%d'), "score": s_score, "interview_id": interview.id})
                existing_skill.score_history = hist
                existing_skill.current_score = round((existing_skill.current_score * 0.4) + (s_score * 0.6), 1)
                existing_skill.attempt_count += 1
                existing_skill.trend = "improving" if s_score >= existing_skill.current_score else "declining"
                existing_skill.weakness_level = "weak" if existing_skill.current_score < 70.0 else ("strong" if existing_skill.current_score >= 80.0 else "moderate")
                existing_skill.updated_at = datetime.utcnow()
            else:
                new_skill = SkillPerformance(
                    user_id=interview.user_id,
                    skill_name=skill_name,
                    category="Technical",
                    current_score=s_score,
                    attempt_count=1,
                    score_history=[{"date": datetime.now().strftime('%Y-%m-%d'), "score": s_score, "interview_id": interview.id}],
                    trend="improving",
                    weakness_level="weak" if s_score < 70.0 else ("strong" if s_score >= 80.0 else "moderate")
                )
                db.add(new_skill)

        today_str = datetime.now().strftime('%Y-%m-%d')
        daily_log = db.query(DailyLog).filter(
            DailyLog.user_id == interview.user_id,
            DailyLog.log_date == today_str
        ).first()

        cat_scores = interview.category_scores or {}
        if daily_log:
            daily_log.interview_count += 1
            daily_log.average_score = round((daily_log.average_score + interview.overall_score) / 2.0, 1)
            daily_log.technical_score = round(cat_scores.get("technical_knowledge", 75.0), 1)
            daily_log.hr_score = round(cat_scores.get("hr_performance", 75.0), 1)
            daily_log.communication_score = round(cat_scores.get("communication_score", 75.0), 1)
            current_weak = list(daily_log.weak_topics or [])
            current_weak.extend(interview.weak_areas or [])
            daily_log.weak_topics = list(set(current_weak))
        else:
            daily_log = DailyLog(
                user_id=interview.user_id,
                log_date=today_str,
                interview_count=1,
                average_score=interview.overall_score,
                technical_score=round(cat_scores.get("technical_knowledge", 75.0), 1),
                hr_score=round(cat_scores.get("hr_performance", 75.0), 1),
                communication_score=round(cat_scores.get("communication_score", 75.0), 1),
                weak_topics=interview.weak_areas or []
            )
            db.add(daily_log)

        user = db.query(User).filter(User.id == interview.user_id).first()
        if user:
            user.streak_count = (user.streak_count or 1) + 1
            user.last_active_date = today_str

        db.commit()

        return {
            "status": "completed",
            "is_completed": True,
            "interview_id": interview.id,
            "overall_score": interview.overall_score,
            "evaluation": evaluation_dto if interview.mode == "practice" else None,
            "next_question": None
        }

    next_q_index = current_q_count + 1
    categories = AdaptiveEngine.calculate_question_distribution(
        interview.total_questions,
        interview.hr_percentage,
        interview.interview_type
    )
    next_category = categories[min(next_q_index - 1, len(categories) - 1)]

    past_questions = db.query(Question).filter(Question.interview_id == interview.id).all()
    tested_skills = [q.target_skill for q in past_questions]
    tested_texts = [q.question_text for q in past_questions]

    weak_records = db.query(SkillPerformance).filter(
        SkillPerformance.user_id == interview.user_id,
        SkillPerformance.current_score < 70.0
    ).all()
    weak_skills = [w.skill_name for w in weak_records]

    next_skill = AdaptiveEngine.select_target_skill(
        job_role=interview.job_role,
        category=next_category,
        weak_skills=weak_skills,
        resume_skills=[],
        tested_skills=tested_skills
    )

    next_q_data = await AdaptiveEngine.generate_next_question(
        job_role=interview.job_role,
        interview_type=interview.interview_type,
        difficulty=interview.difficulty,
        question_number=next_q_index,
        total_questions=interview.total_questions,
        category=next_category,
        target_skill=next_skill,
        resume_summary="",
        weak_skills=weak_skills,
        previous_questions=tested_texts
    )

    next_question = Question(
        interview_id=interview.id,
        question_number=next_q_index,
        question_text=next_q_data.get("question_text", f"Can you describe your approach to {next_skill} in {interview.job_role}?"),
        category=next_category,
        target_skill=next_skill,
        difficulty=interview.difficulty,
        is_follow_up=False,
        context_note=next_q_data.get("context_note", "")
    )
    db.add(next_question)
    interview.current_question_index = next_q_index
    db.commit()
    db.refresh(next_question)

    return {
        "status": "next_question",
        "is_completed": False,
        "evaluation": evaluation_dto if interview.mode == "practice" else None,
        "next_question": QuestionResponse(
            id=next_question.id,
            interview_id=interview.id,
            question_number=next_question.question_number,
            total_questions=interview.total_questions,
            question_text=next_question.question_text,
            category=next_question.category,
            target_skill=next_question.target_skill,
            difficulty=next_question.difficulty,
            is_follow_up=False,
            parent_question_id=None,
            mode=interview.mode,
            previous_evaluation=evaluation_dto if interview.mode == "practice" else None
        )
    }

@router.get("/{interview_id}/report", response_model=InterviewReportResponse)
def get_interview_report(interview_id: str, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    questions = db.query(Question).filter(Question.interview_id == interview.id).order_by(Question.question_number.asc()).all()
    detail_items = []
    
    for q in questions:
        ans = db.query(Answer).filter(Answer.question_id == q.id).first()
        eval_dto = None
        user_ans = None
        if ans:
            user_ans = ans.user_answer
            comm_raw = ans.communication_feedback or {}
            eval_dto = AnswerEvaluationResponse(
                answer_id=ans.id,
                question_id=q.id,
                overall_score=ans.overall_score,
                correctness_score=ans.correctness_score,
                technical_depth_score=ans.technical_depth_score,
                relevance_score=ans.relevance_score,
                completeness_score=ans.completeness_score,
                communication_score=ans.communication_score,
                strong_points=ans.strong_points or [],
                missing_points=ans.missing_points or [],
                incorrect_points=ans.incorrect_points or [],
                communication_feedback=CommunicationFeedback(
                    clarity_level=comm_raw.get("clarity_level", "High"),
                    structure_framework=comm_raw.get("structure_framework", "STAR / Direct"),
                    filler_words_detected=comm_raw.get("filler_words_detected", []),
                    conciseness_score=comm_raw.get("conciseness_score", 80),
                    vocabulary_and_tone=comm_raw.get("vocabulary_and_tone", "Professional"),
                    actionable_suggestion=comm_raw.get("actionable_suggestion", "")
                ),
                improvement_suggestion=ans.improvement_suggestion or "",
                ideal_answer=ans.ideal_answer or "",
                recommended_practice=ans.recommended_practice or "",
                requires_follow_up=ans.requires_follow_up == "true",
                follow_up_reason=ans.follow_up_reason
            )

        detail_items.append(InterviewDetailItem(
            question_number=q.question_number,
            question_text=q.question_text,
            category=q.category,
            target_skill=q.target_skill,
            difficulty=q.difficulty,
            is_follow_up=q.is_follow_up,
            user_answer=user_ans,
            evaluation=eval_dto
        ))

    cats = interview.category_scores or {}
    category_scores_dto = InterviewCategoryScores(
        technical_knowledge=cats.get("technical_knowledge", 75.0),
        problem_solving=cats.get("problem_solving", 70.0),
        communication=cats.get("communication", 78.0),
        hr_performance=cats.get("hr_performance", 72.0),
        resume_knowledge=cats.get("resume_knowledge", 80.0),
        role_knowledge=cats.get("role_knowledge", 74.0)
    )

    pres_raw = interview.presentation_metrics or {}
    pres_analysis_dto = None
    if pres_raw:
        pres_analysis_dto = {
            "camera_presence": pres_raw.get("camera_presence", 85.0),
            "posture": pres_raw.get("posture", "Good"),
            "camera_attention": pres_raw.get("camera_attention", "Good"),
            "movement": pres_raw.get("movement", "Stable"),
            "overall_presentation_score": pres_raw.get("overall_presentation_score", 82.0),
            "recommendations": pres_raw.get("recommendations", [
                "Position the camera at eye level for comfortable engagement.",
                "Maintain a relaxed, upright posture throughout the session."
            ]),
            "is_available": pres_raw.get("is_available", True)
        }

    return InterviewReportResponse(
        id=interview.id,
        job_role=interview.job_role,
        interview_type=interview.interview_type,
        difficulty=interview.difficulty,
        hr_percentage=interview.hr_percentage,
        total_questions=interview.total_questions,
        mode=interview.mode,
        status=interview.status,
        overall_score=interview.overall_score,
        category_scores=category_scores_dto,
        skill_scores=interview.skill_scores or {},
        weak_areas=interview.weak_areas or [],
        strong_areas=interview.strong_areas or [],
        communication_summary=interview.communication_summary or {},
        presentation_analysis=pres_analysis_dto,
        improvement_plan=interview.improvement_plan or [],
        recommended_next_interview=interview.recommended_next_interview or {},
        items=detail_items,
        created_at=interview.created_at,
        completed_at=interview.completed_at
    )

@router.get("/history", response_model=List[InterviewHistorySummary])
def get_interview_history(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    interviews = db.query(Interview).filter(
        Interview.user_id == user.id
    ).order_by(Interview.created_at.desc()).all()

    return [
        InterviewHistorySummary(
            id=i.id,
            job_role=i.job_role,
            interview_type=i.interview_type,
            difficulty=i.difficulty,
            hr_percentage=i.hr_percentage,
            total_questions=i.total_questions,
            mode=i.mode,
            status=i.status,
            overall_score=i.overall_score,
            presentation_score=(i.presentation_metrics or {}).get("overall_presentation_score"),
            weak_areas=i.weak_areas or [],
            strong_areas=i.strong_areas or [],
            created_at=i.created_at,
            completed_at=i.completed_at
        )
        for i in interviews
    ]

import re
import json
from typing import Dict, Any, List
from app.services.gemini_service import gemini_service
from app.services.prompts import ANSWER_EVALUATION_PROMPT, INTERVIEW_SUMMARY_PROMPT

class ScoringService:
    @classmethod
    def _heuristic_evaluate_answer(
        cls,
        question_text: str,
        category: str,
        target_skill: str,
        difficulty: str,
        user_answer: str
    ) -> Dict[str, Any]:
        answer_clean = user_answer.strip()
        word_count = len(answer_clean.split())

        lower_ans = answer_clean.lower()
        is_skipped = any(s in lower_ans for s in ["i don't know", "i do not know", "skip", "not sure", "don't know"])

        if is_skipped or word_count < 6:
            return {
                "overall_score": 30.0 if not is_skipped else 25.0,
                "correctness_score": 25.0,
                "technical_depth_score": 20.0,
                "relevance_score": 40.0,
                "completeness_score": 20.0,
                "communication_score": 60.0 if is_skipped else 40.0,
                "strong_points": ["Acknowledged topic boundary honestly and asked to proceed" if is_skipped else "Attempted brief response"],
                "missing_points": [f"Demonstrated need for foundational practice on {target_skill}", "Explanation of core mechanics and real-world usage"],
                "incorrect_points": [] if is_skipped else ["Answer is too brief to evaluate technical depth"],
                "communication_feedback": {
                    "clarity_level": "Direct" if is_skipped else "Needs Work",
                    "structure_framework": "Honest Pass" if is_skipped else "Fragmented",
                    "filler_words_detected": [],
                    "conciseness_score": 95,
                    "vocabulary_and_tone": "Professional & Direct" if is_skipped else "Too brief",
                    "actionable_suggestion": f"Prioritize reviewing the fundamentals of {target_skill}."
                },
                "improvement_suggestion": f"Dedicate 15-20 minutes to review {target_skill} documentation and sample implementations.",
                "ideal_answer": f"A strong answer for '{question_text}' should cover: 1) Core definition of {target_skill}. 2) How it solves common design challenges. 3) Practical production considerations.",
                "recommended_practice": f"Practice targeted drills on {target_skill}.",
                "requires_follow_up": False,
                "follow_up_reason": None
            }

        is_beginner = difficulty == "Beginner"
        
        tech_indicators = ["because", "used for", "trade-off", "performance", "scale", "optimize", "index", "complexity", "async", "database", "security", "memory", "cache", "error", "example", "create", "build", "frontend", "backend", "store", "data", "web", "language", "tool", "framework"]
        found_indicators = [w for w in tech_indicators if w in answer_clean.lower()]
        
        if is_beginner:
            # Beginner calibration: Focus on clarity, basic definition, and basic purpose
            depth_score = min(92.0, max(60.0, 65.0 + len(found_indicators) * 5.0 + min(20.0, word_count * 0.4)))
            correct_score = min(95.0, max(65.0, 70.0 + len(found_indicators) * 4.0 + min(15.0, word_count * 0.3)))
            comm_score = min(95.0, max(65.0, 72.0 + (12.0 if word_count >= 15 else 5.0)))
            rel_score = 90.0 if target_skill.lower() in answer_clean.lower() or len(found_indicators) >= 1 else 75.0
            comp_score = min(92.0, max(60.0, 65.0 + min(25.0, word_count * 0.6)))
            
            overall = round((correct_score * 0.35) + (depth_score * 0.20) + (rel_score * 0.15) + (comp_score * 0.15) + (comm_score * 0.15), 1)
            requires_fu = (50.0 <= overall <= 78.0) and word_count >= 10

            return {
                "overall_score": overall,
                "correctness_score": round(correct_score, 1),
                "technical_depth_score": round(depth_score, 1),
                "relevance_score": round(rel_score, 1),
                "completeness_score": round(comp_score, 1),
                "communication_score": round(comm_score, 1),
                "strong_points": [
                    f"Correctly identified the fundamental role of {target_skill}",
                    "Explained the concept with clear and understandable wording"
                ],
                "missing_points": [
                    f"Can add a simple example of where {target_skill} is used in a small project"
                ],
                "incorrect_points": [],
                "communication_feedback": {
                    "clarity_level": "High" if comm_score >= 80 else "Moderate",
                    "structure_framework": "Direct Concept Definition",
                    "filler_words_detected": [w for w in ["um", "like", "you know", "basically", "actually"] if re.search(r'\b' + w + r'\b', answer_clean.lower())],
                    "conciseness_score": 88 if 10 <= word_count <= 80 else 75,
                    "vocabulary_and_tone": "Clear, professional, and student-friendly tone.",
                    "actionable_suggestion": f"Keep your definition concise, then mention a simple real-world use case for {target_skill}."
                },
                "improvement_suggestion": f"Good understanding of {target_skill}! Try explaining a simple use case where a developer uses it.",
                "ideal_answer": f"A good beginner answer defines: 1) What {target_skill} is in simple terms. 2) Its main purpose in development. 3) A simple example (e.g. how it helps build or run an app).",
                "recommended_practice": f"Practice explaining {target_skill} in your own words using 2-3 simple sentences.",
                "requires_follow_up": requires_fu,
                "follow_up_reason": "Ask for a simple example to solidify understanding" if requires_fu else None
            }

        # Intermediate, Advanced, and Expert calibration
        depth_score = min(92.0, max(45.0, 45.0 + len(found_indicators) * 4.5 + min(25.0, word_count * 0.2)))
        correct_score = min(95.0, max(50.0, 52.0 + len(found_indicators) * 4.0 + min(20.0, word_count * 0.15)))
        comm_score = min(94.0, max(55.0, 60.0 + (15.0 if word_count >= 30 else 5.0) + (10.0 if "," in answer_clean and "." in answer_clean else 0.0)))
        rel_score = 85.0 if target_skill.lower() in answer_clean.lower() or len(found_indicators) >= 2 else 65.0
        comp_score = min(90.0, max(40.0, 50.0 + min(30.0, word_count * 0.35)))
        
        overall = round((correct_score * 0.30) + (depth_score * 0.25) + (rel_score * 0.15) + (comp_score * 0.15) + (comm_score * 0.15), 1)

        is_hr = category == "HR"
        has_star = any(w in answer_clean.lower() for w in ["situation", "task", "action", "result", "when i was", "we achieved", "outcome"])

        requires_fu = (45.0 <= overall <= 78.0) and word_count >= 15

        return {
            "overall_score": overall,
            "correctness_score": round(correct_score, 1),
            "technical_depth_score": round(depth_score, 1),
            "relevance_score": round(rel_score, 1),
            "completeness_score": round(comp_score, 1),
            "communication_score": round(comm_score, 1),
            "strong_points": [
                f"Demonstrated clear familiarity with {target_skill} concepts",
                "Articulated the core response with professional terminology"
            ],
            "missing_points": [
                "Could elaborate more on boundary conditions and failure handling",
                "Add measurable performance or business impact of this approach"
            ],
            "incorrect_points": [],
            "communication_feedback": {
                "clarity_level": "High" if comm_score >= 80 else "Moderate",
                "structure_framework": "STAR Framework" if is_hr and has_star else ("Definition -> Explanation" if not is_hr else "Direct Narrative"),
                "filler_words_detected": [w for w in ["um", "like", "you know", "basically", "actually"] if re.search(r'\b' + w + r'\b', answer_clean.lower())],
                "conciseness_score": 82 if 30 <= word_count <= 180 else 68,
                "vocabulary_and_tone": "Professional and confident engineering tone.",
                "actionable_suggestion": "Structure your answer clearly: start with a direct executive summary, explain the mechanism, and conclude with the business/technical impact."
            },
            "improvement_suggestion": f"Enhance your explanation by highlighting specific trade-offs when applying {target_skill} in production environments.",
            "ideal_answer": f"An exemplary answer addresses: 1) Core mechanism of {target_skill}. 2) How it solves the specific problem with high reliability. 3) Practical constraints, edge cases, and performance tuning considerations.",
            "recommended_practice": f"Practice architectural trade-off comparisons on {target_skill}.",
            "requires_follow_up": requires_fu,
            "follow_up_reason": f"Ask candidate to elaborate on production trade-offs of {target_skill}" if requires_fu else None
        }

    @classmethod
    async def evaluate_answer(
        cls,
        question_text: str,
        category: str,
        target_skill: str,
        job_role: str,
        difficulty: str,
        user_answer: str
    ) -> Dict[str, Any]:
        prompt = ANSWER_EVALUATION_PROMPT
        prompt = prompt.replace("__QUESTION_TEXT__", question_text)
        prompt = prompt.replace("__CATEGORY__", category)
        prompt = prompt.replace("__TARGET_SKILL__", target_skill)
        prompt = prompt.replace("__JOB_ROLE__", job_role)
        prompt = prompt.replace("__DIFFICULTY__", difficulty)
        prompt = prompt.replace("__USER_ANSWER__", user_answer)

        fallback = lambda: cls._heuristic_evaluate_answer(question_text, category, target_skill, difficulty, user_answer)
        result = await gemini_service.generate_json(prompt, fallback_generator=fallback)

        if not result or "overall_score" not in result:
            return fallback()
        return result

    @classmethod
    async def generate_interview_report(
        cls,
        job_role: str,
        interview_type: str,
        difficulty: str,
        qa_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        formatted_history = []
        for i, item in enumerate(qa_history, 1):
            eval_data = item.get("evaluation", {})
            formatted_history.append(
                f"Q{i} [{item.get('category')} - {item.get('target_skill')}]: {item.get('question_text')}\n"
                f"A{i}: {item.get('user_answer')}\n"
                f"Score: {eval_data.get('overall_score', 70)} (Correctness: {eval_data.get('correctness_score', 70)}, Tech: {eval_data.get('technical_depth_score', 70)}, Comm: {eval_data.get('communication_score', 70)})\n"
            )

        prompt = INTERVIEW_SUMMARY_PROMPT
        prompt = prompt.replace("__JOB_ROLE__", job_role)
        prompt = prompt.replace("__INTERVIEW_TYPE__", interview_type)
        prompt = prompt.replace("__DIFFICULTY__", difficulty)
        prompt = prompt.replace("__QA_HISTORY__", "\n".join(formatted_history))

        def heuristic_report():
            scores = [item.get("evaluation", {}).get("overall_score", 70.0) for item in qa_history]
            avg_score = round(sum(scores) / max(1, len(scores)), 1)
            
            tech_scores = [item.get("evaluation", {}).get("technical_depth_score", 70.0) for item in qa_history if item.get("category") != "HR"]
            avg_tech = round(sum(tech_scores) / max(1, len(tech_scores)), 1) if tech_scores else avg_score
            
            hr_scores = [item.get("evaluation", {}).get("overall_score", 70.0) for item in qa_history if item.get("category") == "HR"]
            avg_hr = round(sum(hr_scores) / max(1, len(hr_scores)), 1) if hr_scores else 75.0

            comm_scores = [item.get("evaluation", {}).get("communication_score", 75.0) for item in qa_history]
            avg_comm = round(sum(comm_scores) / max(1, len(comm_scores)), 1)

            skill_scores = {}
            for item in qa_history:
                skill = item.get("target_skill", "Technical")
                s_score = item.get("evaluation", {}).get("overall_score", 70.0)
                skill_scores[skill] = s_score

            weak_areas = [k for k, v in skill_scores.items() if v < 70.0]
            strong_areas = [k for k, v in skill_scores.items() if v >= 75.0]
            
            if not weak_areas and skill_scores:
                lowest_skill = min(skill_scores.items(), key=lambda x: x[1])[0]
                weak_areas.append(lowest_skill)
            if not strong_areas and skill_scores:
                highest_skill = max(skill_scores.items(), key=lambda x: x[1])[0]
                strong_areas.append(highest_skill)

            return {
                "overall_score": avg_score,
                "category_scores": {
                    "technical_knowledge": avg_tech,
                    "problem_solving": round(avg_score * 0.95, 1),
                    "communication": avg_comm,
                    "hr_performance": avg_hr,
                    "resume_knowledge": round(avg_tech * 1.02, 1),
                    "role_knowledge": round(avg_score * 0.98, 1)
                },
                "skill_scores": skill_scores,
                "weak_areas": weak_areas,
                "strong_areas": strong_areas,
                "communication_summary": {
                    "overall_rating": "Strong Professional Tone" if avg_comm >= 80 else "Clear Communicator with room for structure polish",
                    "strengths": ["Clear articulate delivery", "Effective use of engineering terminology"],
                    "growth_areas": ["Provide more concrete quantifiable metrics", "Structure behavioral answers with explicit STAR headings"]
                },
                "improvement_plan": [
                    f"Dedicate practice to strengthening {weak_areas[0]}" if weak_areas else "Deep dive into advanced system scalability trade-offs.",
                    "Review edge-case error recovery patterns for production APIs.",
                    "Refine elevator pitch and STAR behavioral responses for HR rounds."
                ],
                "recommended_next_interview": {
                    "suggested_type": "Weak-Skill Practice",
                    "focus_topics": weak_areas if weak_areas else ["Advanced System Design"],
                    "target_difficulty": difficulty
                }
            }

        result = await gemini_service.generate_json(prompt, fallback_generator=heuristic_report)
        if not result or "overall_score" not in result:
            return heuristic_report()
        return result

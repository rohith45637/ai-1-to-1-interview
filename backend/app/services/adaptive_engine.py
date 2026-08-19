import random
from typing import List, Dict, Any, Optional
from app.schemas.role import BUILT_IN_JOB_ROLES
from app.services.gemini_service import gemini_service
from app.services.prompts import QUESTION_GENERATION_PROMPT, FOLLOW_UP_QUESTION_PROMPT

class AdaptiveEngine:
    @staticmethod
    def calculate_question_distribution(total_questions: int, hr_percentage: int, interview_type: str) -> List[str]:
        if interview_type == "HR":
            return ["HR"] * total_questions
        elif interview_type == "Technical":
            categories = []
            for i in range(total_questions):
                if i % 3 == 2:
                    categories.append("Scenario")
                else:
                    categories.append("Technical")
            return categories
        elif interview_type == "Resume-Based":
            categories = []
            for i in range(total_questions):
                if i % 2 == 0:
                    categories.append("Resume")
                else:
                    categories.append("Technical")
            return categories
        elif interview_type == "Weak-Skill Practice":
            return ["Technical"] * total_questions

        hr_count = max(0, int(round((hr_percentage / 100.0) * total_questions)))
        if hr_percentage > 0 and hr_count == 0 and total_questions >= 2:
            hr_count = 1
        
        categories = ["Technical"] * total_questions
        hr_placed = 0
        if hr_count > 0:
            categories[0] = "HR"
            hr_placed += 1
        if hr_count > 1 and total_questions > 1:
            categories[-1] = "HR"
            hr_placed += 1
        
        idx = 1
        while hr_placed < hr_count and idx < total_questions - 1:
            if categories[idx] != "HR":
                categories[idx] = "HR"
                hr_placed += 1
            idx += 2

        for i in range(total_questions):
            if categories[i] == "Technical" and i % 3 == 2:
                categories[i] = "Scenario"

        return categories[:total_questions]

    @classmethod
    def select_target_skill(
        cls,
        job_role: str,
        category: str,
        weak_skills: List[str],
        resume_skills: List[str],
        tested_skills: List[str]
    ) -> str:
        if category == "HR":
            hr_skills = ["Self Introduction & Career Goals", "Handling Conflict & Difficult Stakeholders", "Overcoming Technical Failure", "Leadership & Mentorship", "Prioritizing Tight Deadlines", "Constructive Feedback"]
            candidates = [s for s in hr_skills if s not in tested_skills]
            return random.choice(candidates if candidates else hr_skills)

        untested_weak = [s for s in weak_skills if s not in tested_skills]
        if untested_weak and random.random() < 0.65:
            return untested_weak[0]

        if category == "Resume" and resume_skills:
            untested_resume = [s for s in resume_skills if s not in tested_skills]
            if untested_resume:
                return untested_resume[0]

        role_def = next((r for r in BUILT_IN_JOB_ROLES if r["id"] == job_role.lower().replace(" ", "-") or r["title"].lower() == job_role.lower()), None)
        if role_def:
            role_skills = role_def.get("core_technical_skills", [])
            untested_role = [s for s in role_skills if s not in tested_skills]
            if untested_role:
                return random.choice(untested_role)
            return random.choice(role_skills) if role_skills else "Core Engineering Principles"

        return "Technical Problem Solving"

    @classmethod
    async def generate_next_question(
        cls,
        job_role: str,
        interview_type: str,
        difficulty: str,
        question_number: int,
        total_questions: int,
        category: str,
        target_skill: str,
        resume_summary: str,
        weak_skills: List[str],
        previous_questions: List[str]
    ) -> Dict[str, Any]:
        prompt = QUESTION_GENERATION_PROMPT
        prompt = prompt.replace("__JOB_ROLE__", job_role)
        prompt = prompt.replace("__INTERVIEW_TYPE__", interview_type)
        prompt = prompt.replace("__DIFFICULTY__", difficulty)
        prompt = prompt.replace("__QUESTION_NUMBER__", str(question_number))
        prompt = prompt.replace("__TOTAL_QUESTIONS__", str(total_questions))
        prompt = prompt.replace("__CATEGORY__", category)
        prompt = prompt.replace("__TARGET_SKILL__", target_skill)
        prompt = prompt.replace("__RESUME_SUMMARY__", resume_summary or "Software engineering candidate.")
        prompt = prompt.replace("__WEAK_SKILLS__", ", ".join(weak_skills) if weak_skills else "None yet")
        prompt = prompt.replace("__PREVIOUS_QUESTIONS__", "\n".join([f"- {q}" for q in previous_questions]) if previous_questions else "None")

        def heuristic_question():
            if category == "HR":
                if difficulty == "Beginner":
                    questions_pool = [
                        f"Tell me about yourself, your educational background, and what motivated you to learn {job_role}.",
                        f"What are your top technical strengths, and which technologies in {job_role} do you enjoy working with the most?",
                        "How do you usually approach learning a new programming language or tool when you get stuck?",
                        "Can you tell me about a simple college or personal project you worked on recently?"
                    ]
                else:
                    questions_pool = [
                        f"Tell me about yourself and what motivated you to pursue a career in {job_role}.",
                        "Can you describe a situation where you had a disagreement with a team member or technical lead? How did you handle it?",
                        "Describe a project where you faced unexpected roadblocks and a tight deadline. How did you prioritize your deliverables?",
                        "Tell me about a time you received critical constructive feedback on your code or design. How did you respond?"
                    ]
            elif category == "Resume":
                if difficulty == "Beginner":
                    questions_pool = [
                        f"You mentioned {target_skill} in your resume. Can you explain what {target_skill} is and why you decided to learn it?",
                        f"In your project that uses {target_skill}, what was your specific role and what did you build?",
                        f"Can you give a simple example of how you used {target_skill} in your project?"
                    ]
                else:
                    questions_pool = [
                        f"I see {target_skill} listed prominently on your profile. Walk me through a challenging problem you solved using {target_skill}.",
                        f"In your recent project utilizing {target_skill}, how did you approach performance optimization and error handling?",
                        f"Why did you choose {target_skill} for your project over viable architectural alternatives?"
                    ]
            elif difficulty == "Beginner":
                # STRICT BEGINNER RULES: Simple, basic, fundamental concepts
                questions_pool = [
                    f"What is {target_skill}?",
                    f"Why do we use {target_skill} in {job_role}?",
                    f"Can you give a simple example of where {target_skill} is used in a real application?",
                    f"What are the main advantages of using {target_skill} for a developer?",
                    f"If a beginner asks you what {target_skill} is used for, how would you explain it simply?"
                ]
            elif difficulty == "Intermediate":
                # INTERMEDIATE RULES: Practical application, basic debugging, simple comparisons
                questions_pool = [
                    f"How does {target_skill} communicate with or connect to other parts of a {job_role} application?",
                    f"What is a common mistake or bug developers encounter when working with {target_skill}, and how do you fix it?",
                    f"Can you explain the difference between {target_skill} and a common alternative in practical day-to-day coding?",
                    f"How would you structure a basic feature using {target_skill} to ensure good code readability and basic error handling?"
                ]
            elif difficulty == "Expert":
                questions_pool = [
                    f"At massive scale, how do you handle concurrency, race conditions, and distributed consensus when designing systems with {target_skill}?",
                    f"Explain the low-level memory layout, garbage collection / execution internals, and CPU cache performance implications in {target_skill}.",
                    f"Walk through a disaster recovery and zero-downtime migration scenario involving {target_skill}."
                ]
            else: # Advanced
                questions_pool = [
                    f"How would you optimize performance and manage caching/state when working with {target_skill} in a production environment?",
                    f"What are critical security vulnerabilities and edge cases when implementing {target_skill}, and how do you safeguard against them?",
                    f"Explain how you handle asynchronous state, failure modes, and database transactions when working with {target_skill}."
                ]
            
            available = [q for q in questions_pool if q not in previous_questions]
            selected_q = available[0] if available else questions_pool[0]

            return {
                "question_text": selected_q,
                "category": category,
                "target_skill": target_skill,
                "difficulty": difficulty,
                "context_note": f"Evaluating candidate's basic or practical understanding of {target_skill} at {difficulty} level."
            }

        result = await gemini_service.generate_json(prompt, fallback_generator=heuristic_question)
        if not result or "question_text" not in result:
            return heuristic_question()
        return result

    @classmethod
    async def generate_follow_up_question(
        cls,
        original_question: str,
        user_answer: str,
        job_role: str,
        target_skill: str,
        difficulty: str
    ) -> Dict[str, Any]:
        prompt = FOLLOW_UP_QUESTION_PROMPT
        prompt = prompt.replace("__ORIGINAL_QUESTION__", original_question)
        prompt = prompt.replace("__USER_ANSWER__", user_answer)
        prompt = prompt.replace("__JOB_ROLE__", job_role)
        prompt = prompt.replace("__TARGET_SKILL__", target_skill)
        prompt = prompt.replace("__DIFFICULTY__", difficulty)

        def heuristic_follow_up():
            if difficulty == "Beginner":
                fu_text = f"That's a good start. Can you give a simple real-world example of where {target_skill} would be used in a project?"
            elif difficulty == "Intermediate":
                fu_text = f"How would you handle a common error or validation issue when using {target_skill} in that situation?"
            else:
                fu_text = f"You mentioned key points regarding {target_skill}. How would you handle a scenario where this approach fails or encounters high concurrent traffic in production?"

            return {
                "question_text": fu_text,
                "category": "Technical",
                "target_skill": target_skill,
                "difficulty": difficulty,
                "context_note": f"Follow-up probe on {target_skill} at {difficulty} level"
            }

        result = await gemini_service.generate_json(prompt, fallback_generator=heuristic_follow_up)
        if not result or "question_text" not in result:
            return heuristic_follow_up()
        return result

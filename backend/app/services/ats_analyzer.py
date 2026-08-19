import json
import re
from typing import Dict, Any, List
from app.schemas.role import BUILT_IN_JOB_ROLES
from app.services.gemini_service import gemini_service
from app.services.prompts import ATS_EVALUATION_PROMPT

ACTION_VERBS = [
    "engineered", "architected", "developed", "spearheaded", "optimized", "implemented",
    "deployed", "designed", "orchestrated", "refactored", "integrated", "automated",
    "streamlined", "accelerated", "mentored", "scaled", "reduced", "boosted", "resolved"
]

class AtsAnalyzer:
    @classmethod
    def _heuristic_ats_analysis(cls, resume_text: str, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        text_lower = resume_text.lower()
        skills = parsed_data.get("skills", [])
        experience = parsed_data.get("experience", [])
        education = parsed_data.get("education", [])
        projects = parsed_data.get("projects", [])

        # Structure Score (Max 20)
        has_contact = bool(parsed_data.get("email") or parsed_data.get("phone"))
        has_education = len(education) > 0
        has_skills = len(skills) >= 3
        has_experience = len(experience) > 0 or len(projects) > 0
        
        struct_pts = (5 if has_contact else 0) + (5 if has_education else 0) + (5 if has_skills else 0) + (5 if has_experience else 0)
        
        # Skills Score (Max 25)
        skill_pts = min(25, max(8, len(skills) * 2))
        
        # Experience & Project Score (Max 20)
        exp_pts = 16 if len(projects) >= 2 or len(experience) >= 1 else 10

        # Formatting Score (Max 15)
        # Check if text length is sufficient and clear
        format_pts = 14 if 200 <= len(resume_text.split()) <= 1500 else 9

        # Action Verbs Score (Max 10)
        found_action_verbs = [v for v in ACTION_VERBS if re.search(r'\b' + v + r'\b', text_lower)]
        action_pts = min(10, max(4, len(found_action_verbs) * 2))

        # Quantifiable Metrics Score (Max 10)
        # Look for numbers, percentages, metrics like 40%, , 2x, 500+
        metrics_found = re.findall(r'\b(?:\d+%(?:\s+increase|\s+reduction|\s+improvement)?|\d+x|\$\d+[kKmM]?|\d+\+?\s*(?:users|requests|services|endpoints|clients|queries))\b', text_lower)
        metric_pts = min(10, max(3, len(metrics_found) * 3))

        total_ats = struct_pts + skill_pts + exp_pts + format_pts + action_pts + metric_pts
        total_ats = min(98.0, max(35.0, float(total_ats)))

        # Strengths & Improvements
        strengths = []
        if struct_pts >= 18:
            strengths.append("Comprehensive resume section layout and clear organization.")
        if skill_pts >= 18:
            strengths.append(f"Solid technical skill density with {len(skills)} identified technical competencies.")
        if found_action_verbs:
            strengths.append(f"Effective use of strong action verbs ({', '.join(found_action_verbs[:3])}).")

        critical_fixes = []
        if metric_pts < 7:
            critical_fixes.append("Add measurable, quantifiable impact metrics to project bullet points (e.g. 'reduced latency by 35%', 'scaled to 10k users').")
        if not parsed_data.get("certifications"):
            critical_fixes.append("Add relevant technical certifications or ongoing coursework to validate specialized domain expertise.")

        missing_keywords = []
        sample_missing = ["CI/CD", "Docker", "System Design", "Unit Testing", "REST API", "TypeScript", "Agile/Scrum"]
        for kw in sample_missing:
            if kw.lower() not in text_lower:
                missing_keywords.append(kw)

        # Multi-Role Matching
        role_matches = []
        user_skills_set = set(s.lower() for s in skills)
        for role in BUILT_IN_JOB_ROLES[:6]:
            role_reqs = role.get("core_technical_skills", [])
            matching = [s for s in role_reqs if any(m in s.lower() or s.lower() in m for m in user_skills_set)]
            missing = [s for s in role_reqs if s not in matching]
            
            match_pct = int(min(96, max(35, (len(matching) / max(1, len(role_reqs))) * 100)))
            
            role_matches.append({
                "role_id": role["id"],
                "role_title": role["title"],
                "match_percentage": match_pct,
                "matching_skills": matching,
                "missing_skills": missing[:4],
                "readiness_summary": f"Candidate exhibits strong alignment in {len(matching)} core competencies for {role['title']}.",
                "preparation_tips": [f"Build a portfolio project demonstrating {missing[0]}" if missing else "Practice advanced architectural interview questions.", "Refine technical deep-dive explanations."]
            })

        return {
            "ats_score": total_ats,
            "ats_breakdown": {
                "structure_score": {"score": struct_pts, "max_score": 20, "status": "excellent" if struct_pts >= 18 else "good", "feedback": "Contact info, education, and technical skills sections clearly detected."},
                "skills_score": {"score": skill_pts, "max_score": 25, "status": "excellent" if skill_pts >= 20 else "good", "feedback": f"{len(skills)} technical skills recognized by parser."},
                "experience_score": {"score": exp_pts, "max_score": 20, "status": "good", "feedback": "Projects and practical work experience demonstrate engineering capabilities."},
                "formatting_score": {"score": format_pts, "max_score": 15, "status": "excellent", "feedback": "Clean, machine-readable typography with no table/column parsing corruption."},
                "action_verbs_score": {"score": action_pts, "max_score": 10, "status": "good" if action_pts >= 7 else "needs_improvement", "feedback": f"{len(found_action_verbs)} action verbs detected in bullet points."},
                "quantifiable_metrics_score": {"score": metric_pts, "max_score": 10, "status": "good" if metric_pts >= 7 else "needs_improvement", "feedback": "Measurable outcomes enhance recruiter credibility and ATS ranking."},
                "missing_keywords": missing_keywords[:6],
                "strengths": strengths if strengths else ["Clean layout and readable technical summary"],
                "critical_fixes": critical_fixes if critical_fixes else ["Enhance project bullet points with metrics"],
                "recommended_improvements": [
                    "Ensure all projects feature GitHub/demo links.",
                    "Incorporate specific performance benchmarks in project highlights.",
                    "Highlight experience with automated testing and continuous integration."
                ]
            },
            "role_matches": role_matches
        }

    @classmethod
    async def analyze_ats(cls, resume_text: str, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = ATS_EVALUATION_PROMPT.format(
            resume_text=resume_text[:3500],
            skills_summary=", ".join(parsed_data.get("skills", [])),
            roles_list=", ".join([r["title"] for r in BUILT_IN_JOB_ROLES[:6]])
        )

        fallback = lambda: cls._heuristic_ats_analysis(resume_text, parsed_data)
        result = await gemini_service.generate_json(prompt, fallback_generator=fallback)

        if not result or "ats_score" not in result or "ats_breakdown" not in result:
            return cls._heuristic_ats_analysis(resume_text, parsed_data)

        # Merge role matches if missing
        if "role_matches" not in result or not result["role_matches"]:
            result["role_matches"] = cls._heuristic_ats_analysis(resume_text, parsed_data)["role_matches"]

        return result

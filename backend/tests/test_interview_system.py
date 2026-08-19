import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.adaptive_engine import AdaptiveEngine
from app.services.resume_parser import ResumeParser
from app.services.ats_analyzer import AtsAnalyzer

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["project"] == "1 to 1 Interview"

def test_get_roles():
    response = client.get("/api/roles")
    assert response.status_code == 200
    roles = response.json()
    assert len(roles) >= 15
    role_ids = [r["id"] for r in roles]
    assert "full-stack-developer" in role_ids
    assert "cybersecurity-analyst" in role_ids

def test_adaptive_distribution_calculation():
    # 10 questions, 20% HR -> 2 HR, 8 Tech
    dist = AdaptiveEngine.calculate_question_distribution(10, 20, "Mixed")
    assert len(dist) == 10
    assert dist.count("HR") == 2
    
    # 5 questions, 40% HR -> 2 HR, 3 Tech
    dist40 = AdaptiveEngine.calculate_question_distribution(5, 40, "Mixed")
    assert len(dist40) == 5
    assert dist40.count("HR") == 2

    # Technical only
    tech_dist = AdaptiveEngine.calculate_question_distribution(6, 0, "Technical")
    assert "HR" not in tech_dist

def test_resume_heuristics():
    sample_text = """
    Jane Doe
    jane.doe@example.com | (555) 123-4567
    Education: B.S. in Computer Science, 2024
    Skills: Python, FastAPI, React, SQL, Docker, Git, REST API
    Experience: Software Engineer Intern at Acme Corp
    - Developed REST APIs using Python FastAPI and PostgreSQL.
    - Improved query latency by 45% and scaled system to 10k users.
    Projects: E-Commerce Microservices Platform with Docker and Redis.
    """
    extracted = ResumeParser._heuristic_extract(sample_text)
    assert "Python" in extracted["skills"]
    assert "SQL" in extracted["skills"]
    assert extracted["email"] == "jane.doe@example.com"

    ats = AtsAnalyzer._heuristic_ats_analysis(sample_text, extracted)
    assert ats["ats_score"] > 60
    assert "ats_breakdown" in ats
    assert len(ats["role_matches"]) > 0

def test_interview_lifecycle():
    # 1. Create interview
    create_payload = {
        "job_role": "Full Stack Developer",
        "interview_type": "Mixed",
        "difficulty": "Intermediate",
        "hr_percentage": 20,
        "total_questions": 2,
        "mode": "practice"
    }
    create_res = client.post("/api/interviews/create", json=create_payload)
    assert create_res.status_code == 200
    q1 = create_res.json()
    interview_id = q1["interview_id"]
    q1_id = q1["id"]
    assert q1["question_number"] == 1
    assert len(q1["question_text"]) > 10

    # 2. Submit answer to Q1
    ans1_payload = {
        "interview_id": interview_id,
        "question_id": q1_id,
        "user_answer": "In Full Stack development, I structure React components with custom hooks for state management and build asynchronous REST endpoints in Python FastAPI with SQLAlchemy connection pooling and database indexes for fast query execution."
    }
    ans1_res = client.post("/api/interviews/answer", json=ans1_payload)
    assert ans1_res.status_code == 200
    ans1_data = ans1_res.json()
    assert ans1_data["evaluation"] is not None
    assert ans1_data["evaluation"]["overall_score"] >= 50

    if not ans1_data["is_completed"]:
        q2 = ans1_data["next_question"]
        ans2_payload = {
            "interview_id": interview_id,
            "question_id": q2["id"],
            "user_answer": "When facing tight deadlines, I prioritize core user journeys first, communicate transparently with product stakeholders, and use the STAR method to coordinate team code reviews."
        }
        ans2_res = client.post("/api/interviews/answer", json=ans2_payload)
        assert ans2_res.status_code == 200
        ans2_data = ans2_res.json()
        assert ans2_data["is_completed"] is True

    # 3. Fetch final report
    report_res = client.get(f"/api/interviews/{interview_id}/report")
    assert report_res.status_code == 200
    report = report_res.json()
    assert report["overall_score"] > 0
    assert len(report["items"]) >= 1
    assert "technical_knowledge" in report["category_scores"]

def test_analytics_and_skills():
    skills_res = client.get("/api/skills")
    assert skills_res.status_code == 200
    assert len(skills_res.json()) >= 1

    dash_res = client.get("/api/analytics/dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "metrics" in dash_data
    assert "score_trends" in dash_data

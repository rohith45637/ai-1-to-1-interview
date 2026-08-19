# 1 to 1 Interview — AI-Powered 1-to-1 Candidate Assessment Platform

An enterprise-grade AI interview preparation and assessment platform designed to conduct realistic 1-to-1 interviews with natural Indian English voice interaction, prominent candidate live webcam, beginner-friendly difficulty stratification, ATS resume scanning, multi-rubric evaluation (STAR framework), and adaptive weak-skill mastery.

---

## 🌟 Core Features

1. **Dual Entry Modes**:
   - **Resume-Based AI Interview**: Upload PDF/DOCX resumes, extract candidate skills/projects, calculate 0–100 ATS compatibility score, and generate questions tailored to the candidate's actual background.
   - **Direct Role-Based Interview**: Instant mock practice across **20+ curated job roles** (Full Stack, Backend, Frontend, Cloud/DevOps, AI/ML, Data Scientist, Cybersecurity Analyst, etc.).
2. **Realistic AI Interview Chamber**:
   - **AI Interviewer Avatar**: Professional animated human interviewer avatar with dynamic states (Speaking, Listening, Thinking, Greeting).
   - **Large Live Candidate Webcam**: Direct video feed (`getUserMedia`) with mic & camera toggles, live audio wave visualizer, and resilient audio fallback.
   - **Natural Indian English Voice**: Clear Indian English pronunciation at a moderate 0.90x pace with Speech-to-Text (STT) recognition.
   - **"Start Voice Recognition" Button**: Dedicated button for manual and continuous hands-free speech input with silence auto-submit.
   - **Thinking Breather Timer**: Say *"Give me some time"* or click *"Give Me More Time"* to activate a 30s pause without score penalties.
   - **Skip Question**: Say *"I don't know"* or click *"Skip Question"* for seamless progression.
3. **Calibrated Difficulty Stratification**:
   - **Beginner**: Easy, fundamental concepts (e.g. *"What is HTML?"*, *"What is an API?"*, *"Why do we use databases?"*).
   - **Intermediate**: Practical application and basic connections.
   - **Advanced**: Architecture, security, and performance.
   - **Expert**: High-scale distributed systems and disaster recovery.
4. **6-Dimension Evaluation & STAR Feedback**:
   - Technical Knowledge, Problem Solving, Communication, HR/Behavioral Performance, Resume Competency Match, and Role Alignment.
   - Question-by-question review with ideal model answers.
5. **Dashboard & History**:
   - Score trends, skill matrix tracking, weak areas practice, and recent interview scorecards with direct review links.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start the FastAPI Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
*Backend runs on `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`)*

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 Environment Configuration

Create a `.env` file in `backend/` (or copy from `backend/.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite:///./interview.db
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🧪 Running Automated Tests
```bash
cd backend
pytest tests/test_interview_system.py
```
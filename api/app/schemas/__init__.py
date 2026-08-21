from app.schemas.user import UserBase, UserUpdate, UserResponse, UserSettings
from app.schemas.role import JobRoleDefinition, BUILT_IN_JOB_ROLES
from app.schemas.resume import (
    CandidateProfile, RoleMatchResult, AtsBreakdown,
    ResumeUploadResponse, ResumeVersionSummary
)
from app.schemas.interview import (
    InterviewCreateRequest, AnswerSubmissionRequest, AnswerEvaluationResponse,
    QuestionResponse, InterviewReportResponse, InterviewHistorySummary,
    InterviewDetailItem, InterviewCategoryScores, CommunicationFeedback
)
from app.schemas.analytics import (
    SkillScoreItem, ProgressMetricSummary, ScoreTrendPoint,
    DailyActivityLogItem, DashboardAnalyticsResponse
)

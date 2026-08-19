import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { ResumeUploadPage } from './pages/ResumeUploadPage';
import { AtsAnalyzerPage } from './pages/AtsAnalyzerPage';
import { InterviewConfigModal } from './pages/InterviewConfigModal';
import { InterviewRoomPage } from './pages/InterviewRoomPage';
import { InterviewReportPage } from './pages/InterviewReportPage';
import { DashboardPage } from './pages/DashboardPage';
import { WeakSkillsPracticePage } from './pages/WeakSkillsPracticePage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configRole, setConfigRole] = useState(null);
  const [configResumeId, setConfigResumeId] = useState(null);
  const [configType, setConfigType] = useState('Mixed');
  const [configWeakSkills, setConfigWeakSkills] = useState(null);

  // Active Interview Session State
  const [activeInterviewConfig, setActiveInterviewConfig] = useState(null);
  const [viewingReportId, setViewingReportId] = useState(null);
  const [viewingResumeAts, setViewingResumeAts] = useState(null);

  // Trigger from Landing Page or Direct Roles
  const handleStartDirectInterview = (role) => {
    setConfigRole(role);
    setConfigResumeId(null);
    setConfigType('Mixed');
    setConfigWeakSkills(null);
    setIsConfigOpen(true);
  };

  // Trigger from Resume Page
  const handleStartInterviewWithResume = (resume) => {
    const roleTitle = resume.parsed_data?.job_roles?.[0] || 'Full Stack Developer';
    setConfigRole({ title: roleTitle });
    setConfigResumeId(resume.id);
    setConfigType('Resume-Based');
    setConfigWeakSkills(null);
    setIsConfigOpen(true);
  };

  // Trigger from Weak Skills Drill
  const handleLaunchWeakSkills = (skillsList) => {
    setConfigRole({ title: 'Full Stack Developer' });
    setConfigResumeId(null);
    setConfigType('Weak-Skill Practice');
    setConfigWeakSkills(skillsList);
    setIsConfigOpen(true);
  };

  // Callback when user confirms launch in modal
  const handleLaunchInterviewSession = (config) => {
    setIsConfigOpen(false);
    setActiveInterviewConfig(config);
    setActiveTab('interview');
  };

  // Callback when interview ends
  const handleInterviewComplete = (interviewId) => {
    setViewingReportId(interviewId);
    setActiveTab('report');
    setActiveInterviewConfig(null);
  };

  // Navigation handlers
  const handleNavigateToAts = (resume) => {
    setViewingResumeAts(resume);
    setActiveTab('ats');
  };

  const handleViewReportFromDashboard = (interviewId) => {
    setViewingReportId(interviewId);
    setActiveTab('report');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      
      {/* Top Navbar without separate History tab */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {activeTab === 'landing' && (
          <LandingPage
            onStartDirectInterview={handleStartDirectInterview}
            onNavigateToResume={() => setActiveTab('resume')}
            onNavigateToWeakSkills={() => setActiveTab('weak-skills')}
          />
        )}

        {activeTab === 'resume' && (
          <ResumeUploadPage
            onStartInterviewWithResume={handleStartInterviewWithResume}
            onNavigateToAts={handleNavigateToAts}
          />
        )}

        {activeTab === 'ats' && (
          <AtsAnalyzerPage
            resumeData={viewingResumeAts}
            onStartRoleInterview={(roleMatch) => handleStartDirectInterview({ title: roleMatch.role_title })}
          />
        )}

        {activeTab === 'interview' && activeInterviewConfig && (
          <InterviewRoomPage
            initialConfig={activeInterviewConfig}
            onInterviewComplete={handleInterviewComplete}
            onExitInterview={() => setActiveTab('landing')}
          />
        )}

        {activeTab === 'report' && (
          <InterviewReportPage
            interviewId={viewingReportId}
            onPracticeWeakSkills={handleLaunchWeakSkills}
            onRetakeInterview={(roleTitle) => handleStartDirectInterview({ title: roleTitle })}
            onBackToHub={() => setActiveTab('landing')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            onStartPractice={() => handleStartDirectInterview({ title: 'Full Stack Developer' })}
            onPracticeWeakSkills={handleLaunchWeakSkills}
            onViewReport={handleViewReportFromDashboard}
          />
        )}

        {activeTab === 'weak-skills' && (
          <WeakSkillsPracticePage
            onLaunchWeakPractice={handleLaunchWeakSkills}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Interview Configuration Modal */}
      <InterviewConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        initialRole={configRole}
        initialResumeId={configResumeId}
        initialType={configType}
        initialWeakSkills={configWeakSkills}
        onLaunchInterview={handleLaunchInterviewSession}
      />

      {/* Modern Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 bg-white/50 dark:bg-surface-900/50 py-6 text-center text-xs text-surface-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} <strong>1 to 1 Interview</strong> • Powered by Google DeepMind Gemini</span>
          <span className="text-surface-400">Professional 1:1 AI Career Assessment & Simulator</span>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
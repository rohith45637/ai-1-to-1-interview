import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, interviewsApi, resumesApi } from '../services/api';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar, Legend, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  TrendingUp, Flame, Trophy, BarChart3, Target, 
  CheckCircle2, AlertCircle, Sparkles, ArrowRight, Clock, 
  FileText, ExternalLink, Calendar, ChevronRight, Activity, Zap
} from 'lucide-react';

export function DashboardPage({ onStartPractice, onPracticeWeakSkills, onViewReport }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [latestResume, setLatestResume] = useState(null);
  const [loading, setLoading] = useState(true);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [dashResult, histResult, resumeResult] = await Promise.allSettled([
          analyticsApi.getDashboard(),
          interviewsApi.getHistory(),
          resumesApi.getLatest()
        ]);
        if (dashResult.status === 'fulfilled') setData(dashResult.value);
        if (histResult.status === 'fulfilled') setHistory(histResult.value);
        if (resumeResult.status === 'fulfilled') setLatestResume(resumeResult.value);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-surface-400">Loading Candidate Analytics & Assessment History...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const scoreTrends = data?.score_trends || [];
  const skillMatrix = data?.skill_matrix || [];
  const candidateName = user?.name || 'Candidate';
  const atsScore = latestResume?.ats_score || 82;

  // Radar chart data for competencies
  const radarData = [
    { subject: 'Technical Depth', A: metrics.avg_technical || 85, fullMark: 100 },
    { subject: 'Communication', A: metrics.avg_communication || 78, fullMark: 100 },
    { subject: 'Confidence', A: metrics.avg_confidence || 82, fullMark: 100 },
    { subject: 'Presentation', A: metrics.avg_presentation || 76, fullMark: 100 },
    { subject: 'Problem Solving', A: metrics.avg_problem_solving || 88, fullMark: 100 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 pb-24 text-surface-200">
      
      {/* ------------------------------------------------------------- */}
      {/* GREETING & HERO CTA */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="brand" dot={true}>Candidate Intelligence Hub</Badge>
            <span className="text-xs text-surface-400">• Real-time Trajectory</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {getGreeting()}, {candidateName}
          </h1>
          <p className="text-sm text-surface-400 mt-0.5">
            Ready for your next interview? Track your performance trajectory and isolate skill gaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={onStartPractice}
            icon={Sparkles}
            className="font-bold shadow-lg shadow-brand-500/20"
          >
            Start Interview
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4 CORE KPI CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Interviews */}
        <Card className="p-5 space-y-3 border-surface-800 bg-surface-900/80">
          <div className="flex items-center justify-between text-xs font-semibold text-surface-400">
            <span>Total Interviews</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {metrics.total_interviews || history.length || 0}
          </div>
          <p className="text-[11px] text-surface-400">
            Completed 1-to-1 mock sessions
          </p>
        </Card>

        {/* KPI 2: Average Score */}
        <Card className="p-5 space-y-3 border-surface-800 bg-surface-900/80">
          <div className="flex items-center justify-between text-xs font-semibold text-surface-400">
            <span>Average Score</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-400">
            {metrics.avg_score || (history.length > 0 ? Math.round(history.reduce((acc, h) => acc + (h.overall_score || 70), 0) / history.length) : 0)}
            <span className="text-xs text-surface-400 font-bold"> / 100</span>
          </div>
          <p className="text-[11px] text-surface-400">
            Across all attempted rounds
          </p>
        </Card>

        {/* KPI 3: Best Score */}
        <Card className="p-5 space-y-3 border-surface-800 bg-surface-900/80">
          <div className="flex items-center justify-between text-xs font-semibold text-surface-400">
            <span>Best Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {metrics.best_score || (history.length > 0 ? Math.max(...history.map(h => h.overall_score || 0)) : 0)}
            <span className="text-xs text-surface-400 font-bold"> / 100</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> High-water benchmark
          </p>
        </Card>

        {/* KPI 4: Resume ATS Score */}
        <Card className="p-5 space-y-3 border-surface-800 bg-surface-900/80">
          <div className="flex items-center justify-between text-xs font-semibold text-surface-400">
            <span>Resume ATS Score</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400">
            {atsScore}
            <span className="text-xs text-surface-400 font-bold"> / 100</span>
          </div>
          <p className="text-[11px] text-surface-400">
            {latestResume ? `Parsed: ${latestResume.file_name}` : 'Default Benchmark'}
          </p>
        </Card>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* PERFORMANCE OVERVIEW CHARTS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Score Trends Line Chart */}
        <Card className="lg:col-span-2 p-6 space-y-4 border-surface-800 bg-surface-900/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Score Trajectory</h3>
              <p className="text-xs text-surface-400">Chronological score progression across interview rounds</p>
            </div>
            <Badge variant="brand" size="xs">Performance Curve</Badge>
          </div>

          <div className="h-64 w-full pt-4">
            {scoreTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="session_name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ fill: '#3b82f6', r: 4 }} 
                    activeDot={{ r: 6, fill: '#60a5fa' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-surface-500">
                Complete at least two interviews to populate score curves.
              </div>
            )}
          </div>
        </Card>

        {/* Right: Competency Radar */}
        <Card className="p-6 space-y-4 border-surface-800 bg-surface-900/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">5-Pillar Radar</h3>
              <p className="text-xs text-surface-400">Holistic balance across dimensions</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                <Radar name="Candidate" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* RECENT INTERVIEWS SECTION */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Interviews</h2>
            <p className="text-xs text-surface-400">Past mock sessions with role, difficulty, score, and comprehensive reports.</p>
          </div>
        </div>

        {history.length === 0 ? (
          <Card className="text-center p-10 space-y-3 border-surface-800 bg-surface-900/60">
            <div className="w-12 h-12 rounded-2xl bg-surface-800 text-surface-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Interview Records Yet</h3>
            <p className="text-xs text-surface-400 max-w-sm mx-auto">
              Start your first 1-to-1 interview session to generate comprehensive assessment scorecards.
            </p>
            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={onStartPractice} icon={Sparkles}>
                Launch First Interview
              </Button>
            </div>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-surface-800 bg-surface-900/80 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-800 text-surface-400 font-semibold uppercase tracking-wider bg-surface-950/40">
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800 text-surface-300">
                {history.slice(0, 6).map((item) => (
                  <tr key={item.id} className="hover:bg-surface-850/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.job_role}
                    </td>
                    <td className="py-3.5 px-4 text-surface-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="brand" size="xs">{item.difficulty}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-mono font-bold text-sm ${
                        (item.overall_score || 0) >= 75 ? 'text-emerald-400' : (item.overall_score || 0) >= 60 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {item.overall_score || 0} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onViewReport(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-brand-600 hover:text-white text-surface-300 font-semibold transition-all cursor-pointer"
                      >
                        <span>View Report</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
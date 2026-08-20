import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { analyticsApi, interviewsApi } from '../services/api';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar, Legend 
} from 'recharts';
import { 
  TrendingUp, Flame, Trophy, BarChart3, Target, 
  CheckCircle2, AlertCircle, Sparkles, ArrowRight, Clock, Layers, FileText
} from 'lucide-react';

export function DashboardPage({ onStartPractice, onPracticeWeakSkills, onViewReport }) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [dashResult, histResult] = await Promise.allSettled([
          analyticsApi.getDashboard(),
          interviewsApi.getHistory()
        ]);
        if (dashResult.status === 'fulfilled') setData(dashResult.value);
        if (histResult.status === 'fulfilled') setHistory(histResult.value);
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
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-surface-500">Loading Candidate Analytics & Performance History...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const scoreTrends = data?.score_trends || [];
  const skillMatrix = data?.skill_matrix || [];

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="brand" className="mb-2">Performance Intelligence</Badge>
          <h1 className="text-3xl font-black text-surface-900 dark:text-white">Candidate Progress & Assessment Hub</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Tracking your interview trajectory, competency benchmarks, and recent session scorecards.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onStartPractice}
          icon={Sparkles}
          className="font-bold shadow-md shadow-brand-500/20"
        >
          Start New 1-to-1 Interview
        </Button>
      </div>

      {/* TOP SECTION: 5 HERO METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <Card className="p-4 space-y-2 border-brand-500/20 bg-gradient-to-br from-white to-brand-50/20 dark:from-surface-900 dark:to-brand-950/20">
          <span className="text-[11px] font-bold text-surface-400 uppercase">Last Score</span>
          <div className="text-3xl font-black text-brand-600 dark:text-brand-400">
            {metrics.today_score || 0} <span className="text-xs text-surface-400 font-bold">/ 100</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +{metrics.improvement_percentage || 0}% trajectory
          </span>
        </Card>

        <Card className="p-4 space-y-2">
          <span className="text-[11px] font-bold text-surface-400 uppercase">Best Score</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.best_score || 0} <span className="text-xs text-surface-400 font-bold">/ 100</span>
          </div>
          <span className="text-[11px] text-surface-500 font-medium">Personal Benchmark</span>
        </Card>

        <Card className="p-4 space-y-2">
          <span className="text-[11px] font-bold text-surface-400 uppercase">Average Score</span>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {metrics.average_score || 0} <span className="text-xs text-surface-400 font-bold">/ 100</span>
          </div>
          <span className="text-[11px] text-surface-500 font-medium">Across all sessions</span>
        </Card>

        <Card className="p-4 space-y-2">
          <span className="text-[11px] font-bold text-surface-400 uppercase">Interviews Done</span>
          <div className="text-3xl font-black text-surface-900 dark:text-white">
            {metrics.total_interviews || history.length || 0}
          </div>
          <span className="text-[11px] text-surface-500 font-medium">Total Completed</span>
        </Card>

        <Card className="p-4 space-y-2 border-amber-500/20 bg-gradient-to-br from-white to-amber-50/20 dark:from-surface-900 dark:to-amber-950/20">
          <span className="text-[11px] font-bold text-amber-600 uppercase flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Daily Streak
          </span>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {metrics.daily_streak || 1} <span className="text-xs text-surface-400 font-bold">Days</span>
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">Active Preparation</span>
        </Card>

      </div>

      {/* SCORE IMPROVEMENT TRAJECTORY PROGRESSION */}
      {scoreTrends.length > 1 && (
        <Card className="p-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">Score Progression</span>
            <h4 className="font-black text-lg">
              {scoreTrends.map(st => st.overall_score).join(' → ')}
            </h4>
          </div>
          <div className="text-xs text-white/90 font-medium">
            Consistent upward trend across recent sessions!
          </div>
        </Card>
      )}

      {/* MIDDLE SECTION: SCORE IMPROVEMENT & SKILL CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Line Chart: Score Progression */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-surface-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              Score Improvement Progression
            </h3>
            <Badge variant="brand" size="sm">Session Trend</Badge>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrends} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[40, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="overall_score" name="Overall Score" stroke="#0c87eb" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="technical_score" name="Technical Knowledge" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="communication_score" name="Communication" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="2 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart: Skill Matrix */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-surface-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Skill-Wise Competency Scores
            </h3>
            <Badge variant="purple" size="sm">Skill Matrix</Badge>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillMatrix} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="skill_name" stroke="#94a3b8" fontSize={10} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="current_score" name="Current Score" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* WEAK SKILLS VS STRONG SKILLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Weak Skills */}
        <Card className="p-6 space-y-4 border-rose-500/20 bg-rose-50/20 dark:bg-rose-950/10">
          <div className="flex items-center justify-between pb-2 border-b border-rose-200/60 dark:border-rose-900/60">
            <span className="font-bold text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Needs Practice (Weak Areas &lt; 70)
            </span>
            <Badge variant="danger" size="sm">{metrics.weak_skills?.length || 0} Topics</Badge>
          </div>

          <div className="space-y-3">
            {metrics.weak_skills?.map((sk, i) => (
              <div key={i} className="p-3 rounded-xl bg-white dark:bg-surface-900 border border-rose-200/80 dark:border-rose-900/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-surface-900 dark:text-white block">{sk.skill_name}</span>
                  <span className="text-surface-400 text-[11px]">{sk.category} • Trend: {sk.trend}</span>
                </div>
                <span className="font-black text-rose-600 dark:text-rose-400 text-sm">{Math.round(sk.current_score)}%</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPracticeWeakSkills(metrics.weak_skills?.map(s => s.skill_name))}
              className="w-full font-bold text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800"
              icon={Target}
            >
              Launch Targeted Weak-Skill Practice
            </Button>
          </div>
        </Card>

        {/* Strong Skills */}
        <Card className="p-6 space-y-4 border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 dark:border-emerald-900/60">
            <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Mastered & Strong Areas (&ge; 75)
            </span>
            <Badge variant="success" size="sm">{metrics.strong_skills?.length || 0} Topics</Badge>
          </div>

          <div className="space-y-3">
            {metrics.strong_skills?.map((sk, i) => (
              <div key={i} className="p-3 rounded-xl bg-white dark:bg-surface-900 border border-emerald-200/80 dark:border-emerald-900/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-surface-900 dark:text-white block">{sk.skill_name}</span>
                  <span className="text-surface-400 text-[11px]">{sk.category} • {sk.attempt_count} attempts</span>
                </div>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{Math.round(sk.current_score)}%</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* RECENT INTERVIEW PERFORMANCE & SCORECARDS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-500" />
            Recent Interview Performance & Scorecards ({history.length})
          </h3>
          <Badge variant="brand" size="sm">Stored History</Badge>
        </div>

        {history.length === 0 ? (
          <Card className="text-center p-8 space-y-2">
            <Clock className="w-8 h-8 text-surface-400 mx-auto" />
            <p className="text-xs text-surface-500">No previous interview records yet. Complete your first 1-to-1 interview session to track history here.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map(item => (
              <Card
                key={item.id}
                onClick={() => onViewReport && onViewReport(item.id)}
                className="p-5 hover:border-brand-500 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {item.job_role}
                    </span>
                    <span className="text-xl font-black text-brand-600 dark:text-brand-400">
                      {item.overall_score || 0}<span className="text-xs text-surface-400">/100</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="brand" size="sm">{item.difficulty}</Badge>
                    <Badge variant="purple" size="sm">{item.interview_type}</Badge>
                    {item.presentation_score && (
                      <Badge variant="success" size="sm">Presentation: {Math.round(item.presentation_score)}%</Badge>
                    )}
                    <span className="text-[11px] text-surface-400">• {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="text-[11px] text-surface-500 flex items-center gap-3">
                    <span>Questions: <strong>{item.total_questions}</strong></span>
                    <span>HR Ratio: <strong>{item.hr_percentage}%</strong></span>
                    <span>Mode: <strong className="capitalize">{item.mode}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 font-bold">
                  <span>View Assessment Report</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
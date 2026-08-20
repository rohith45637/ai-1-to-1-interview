import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { interviewsApi } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  Trophy, CheckCircle2, AlertCircle, Sparkles, ArrowRight, 
  RotateCcw, Download, Share2, ThumbsUp, ThumbsDown, BookOpen, 
  Layers, MessageSquare, Target, Printer, ChevronDown, ChevronUp
} from 'lucide-react';

export function InterviewReportPage({ interviewId, onPracticeWeakSkills, onRetakeInterview, onBackToHub }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const data = await interviewsApi.getReport(interviewId);
        setReport(data);
        // Expand first question by default
        setExpandedQuestions({ 0: true });

        // Trigger confetti celebration if good score
        if (data.overall_score >= 70) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (e) {}
        }
      } catch (err) {
        console.error('Failed to load interview report:', err);
      } finally {
        setLoading(false);
      }
    }
    if (interviewId) fetchReport();
  }, [interviewId]);

  const toggleQuestion = (idx) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-xl font-bold text-surface-900 dark:text-white">Synthesizing Comprehensive Report...</h3>
        <p className="text-xs text-surface-500">Compiling 6-dimension scores, STAR communication critique, and personalized strategy.</p>
      </div>
    );
  }

  if (!report) {
    return (
      <Card className="max-w-xl mx-auto my-12 text-center p-8 space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-surface-900 dark:text-white">Report Unavailable</h3>
        <p className="text-xs text-surface-500">Could not retrieve the interview assessment report.</p>
        <Button variant="primary" size="sm" onClick={onBackToHub}>Return to Practice Hub</Button>
      </Card>
    );
  }

  const score = report.overall_score || 76;
  const cats = report.category_scores || {};
  const dimScores = [
    { label: 'Technical Knowledge', value: cats.technical_knowledge || score },
    { label: 'Problem Solving Depth', value: cats.problem_solving || score },
    { label: 'Communication & Delivery', value: cats.communication || score },
    { label: 'HR / Behavioral Performance', value: cats.hr_performance || score },
    { label: 'Resume Competency Match', value: cats.resume_knowledge || score },
    { label: 'Role Alignment', value: cats.role_knowledge || score },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 pb-24 print:p-0">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 pb-6 print:hidden">
        <div>
          <Badge variant="brand" className="mb-1.5">Official Assessment Record</Badge>
          <h1 className="text-3xl font-black text-surface-900 dark:text-white">Interview Assessment Report</h1>
          <p className="text-xs text-surface-500 mt-1">
            Target Role: <strong className="text-surface-900 dark:text-white">{report.job_role}</strong> • {report.difficulty} Level • {new Date(report.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint} icon={Printer} className="text-xs">
            Export / Print
          </Button>
          <Button variant="primary" size="sm" onClick={() => onRetakeInterview(report.job_role)} icon={RotateCcw} className="text-xs font-bold">
            Retake Interview
          </Button>
        </div>
      </div>

      {/* Hero Score Card */}
      <Card className="relative overflow-hidden border-2 border-brand-500/30 p-8 bg-gradient-to-br from-white via-white to-brand-50/30 dark:from-surface-900 dark:via-surface-900 dark:to-brand-950/30 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Left: Overall Score Circle */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 lg:border-r lg:border-surface-200 dark:lg:border-surface-800 lg:pr-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-surface-400">Overall Interview Score</span>
              <div className="text-5xl font-black text-brand-600 dark:text-brand-400 mt-1">{score} <span className="text-xl text-surface-400">/ 100</span></div>
            </div>

            <Badge variant={score >= 75 ? 'success' : 'warning'} size="md" className="font-bold text-xs">
              {score >= 80 ? 'Interview Ready • High Hire Probability' : 'Competent • Target Weak Concepts'}
            </Badge>
          </div>

          {/* Right: 6-Dimension Score Bars */}
          <div className="lg:col-span-2 space-y-3.5">
            <h3 className="font-bold text-sm text-surface-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              6-Dimensional Candidate Assessment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {dimScores.map(dim => (
                <div key={dim.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-surface-600 dark:text-surface-300">{dim.label}</span>
                    <span className="font-bold text-surface-900 dark:text-white">{Math.round(dim.value)}%</span>
                  </div>
                  <ProgressBar value={dim.value} max={100} showValue={false} color={dim.value >= 75 ? 'success' : 'brand'} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </Card>

      {/* WEAK AREAS VS STRONG AREAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strong Areas */}
        <Card className="space-y-4 border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300 pb-2 border-b border-emerald-200/60 dark:border-emerald-900/60">
            <ThumbsUp className="w-4 h-4" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-surface-700 dark:text-surface-300">
            {(report.strong_areas || ['Solid foundational engineering communication']).map((sa, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{sa}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Weak Areas to Target */}
        <Card className="space-y-4 border-rose-500/20 bg-rose-50/20 dark:bg-rose-950/10">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-700 dark:text-rose-300 pb-2 border-b border-rose-200/60 dark:border-rose-900/60">
            <ThumbsDown className="w-4 h-4" />
            <span>Priority Weak Areas Identified</span>
          </div>
          <ul className="space-y-2 text-xs text-surface-700 dark:text-surface-300">
            {(report.weak_areas || ['Edge case performance tuning']).map((wa, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{wa}</span>
              </li>
            ))}
          </ul>
          
          <div className="pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPracticeWeakSkills(report.weak_areas)}
              className="w-full text-xs font-bold text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950"
              icon={Target}
            >
              Practice These Weak Areas Now
            </Button>
          </div>
        </Card>

      </div>

      {/* COMMUNICATION QUALITY ANALYSIS */}
      {report.communication_summary && (
        <Card className="space-y-4 p-6 bg-gradient-to-r from-surface-50 to-brand-50/20 dark:from-surface-900 dark:to-brand-950/20">
          <div className="flex items-center gap-2 font-bold text-sm text-surface-900 dark:text-white pb-2 border-b border-surface-200 dark:border-surface-800">
            <MessageSquare className="w-4 h-4 text-brand-500" />
            <span>Communication & Delivery Critique (STAR Method Analysis)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-surface-700 dark:text-surface-300">
            <div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Communication Strengths:</span>
              <ul className="space-y-1">
                {(report.communication_summary.strengths || ['Clear and articulate vocabulary']).map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">Growth & Structure Tips:</span>
              <ul className="space-y-1">
                {(report.communication_summary.growth_areas || ['Structure behavioral questions with explicit STAR elements']).map((g, i) => (
                  <li key={i}>• {g}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* INTERVIEW PRESENTATION ANALYSIS (WEBCAM & BODY LANGUAGE) */}
      {report.presentation_analysis && report.presentation_analysis.is_available !== false ? (
        <Card className="space-y-5 p-6 border-2 border-indigo-500/20 bg-gradient-to-br from-white via-white to-indigo-50/20 dark:from-surface-900 dark:via-surface-900 dark:to-indigo-950/20 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-2 font-bold text-sm text-surface-900 dark:text-white">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Interview Presentation Analysis</span>
              <Badge variant="purple" size="sm">Non-Diagnostic Feedback</Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 font-medium">Overall Presentation:</span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                {Math.round(report.presentation_analysis.overall_presentation_score || 82)}%
              </span>
            </div>
          </div>

          {/* 4 Presentation Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-1">
              <span className="text-[11px] font-bold text-surface-500 uppercase block">Camera Presence</span>
              <div className="text-xl font-black text-surface-900 dark:text-white">
                {Math.round(report.presentation_analysis.camera_presence || 85)}%
              </div>
              <span className="text-[10px] text-surface-400">Face framing in center</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-1">
              <span className="text-[11px] font-bold text-surface-500 uppercase block">Sitting Posture</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {report.presentation_analysis.posture || 'Good'}
              </div>
              <span className="text-[10px] text-surface-400">Upright & stable position</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-1">
              <span className="text-[11px] font-bold text-surface-500 uppercase block">Camera Attention</span>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {report.presentation_analysis.camera_attention || 'Good'}
              </div>
              <span className="text-[10px] text-surface-400">Facing & eye engagement</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-1">
              <span className="text-[11px] font-bold text-surface-500 uppercase block">Movement Stability</span>
              <div className="text-xl font-black text-brand-600 dark:text-brand-400">
                {report.presentation_analysis.movement || 'Stable'}
              </div>
              <span className="text-[10px] text-surface-400">Steady body posture</span>
            </div>
          </div>

          {/* Presentation Recommendations */}
          {report.presentation_analysis.recommendations && report.presentation_analysis.recommendations.length > 0 && (
            <div className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/60 space-y-1.5">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block">Personalized Presentation Recommendations:</span>
              <ul className="space-y-1 text-xs text-surface-700 dark:text-surface-300">
                {report.presentation_analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-4 bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 flex items-center justify-between text-xs text-surface-500">
          <span>Presentation analysis was unavailable for this audio session.</span>
          <span className="text-[11px] text-surface-400">Enable webcam in future sessions for body-language feedback.</span>
        </Card>
      )}

      {/* QUESTION BY QUESTION ACCORDION REVIEW */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-500" />
          Question-by-Question Deep Dive ({report.items?.length || 0})
        </h3>

        <div className="space-y-3">
          {report.items?.map((item, idx) => {
            const isExpanded = !!expandedQuestions[idx];
            const evalData = item.evaluation;

            return (
              <Card key={idx} className="p-5 space-y-4 transition-all">
                {/* Header line */}
                <div
                  onClick={() => toggleQuestion(idx)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-bold text-xs flex items-center justify-center">
                      Q{item.question_number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="brand" size="sm">{item.category}</Badge>
                        <Badge variant="purple" size="sm">{item.target_skill}</Badge>
                        {item.is_follow_up && <Badge variant="warning" size="sm">Follow-Up</Badge>}
                      </div>
                      <h4 className="font-bold text-sm text-surface-900 dark:text-white mt-1">
                        {item.question_text}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {evalData && (
                      <span className="font-black text-sm text-brand-600 dark:text-brand-400">
                        {evalData.overall_score}/100
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-4 border-t border-surface-100 dark:border-surface-800 space-y-4 text-xs animate-in fade-in duration-150">
                    
                    {/* Candidate Answer */}
                    <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-1">
                      <span className="font-bold text-surface-500 uppercase text-[10px] block">Your Answer Submitted:</span>
                      <p className="text-surface-900 dark:text-white leading-relaxed whitespace-pre-line">
                        {item.user_answer || '(No answer recorded)'}
                      </p>
                    </div>

                    {evalData && (
                      <>
                        {/* Strong and Missing Points */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                            <span className="font-bold text-emerald-700 dark:text-emerald-300 block">Accurate & Strong Points</span>
                            <ul className="space-y-1 text-surface-700 dark:text-surface-300">
                              {evalData.strong_points?.map((sp, i) => (
                                <li key={i}>• {sp}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-1">
                            <span className="font-bold text-rose-700 dark:text-rose-300 block">Missing Nuance & Concepts</span>
                            <ul className="space-y-1 text-surface-700 dark:text-surface-300">
                              {evalData.missing_points?.map((mp, i) => (
                                <li key={i}>• {mp}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Ideal Answer Guidance */}
                        {evalData.ideal_answer && (
                          <div className="p-3.5 rounded-xl bg-brand-50/50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 space-y-1">
                            <span className="font-bold text-brand-700 dark:text-brand-300 uppercase text-[10px] block">Ideal Answer Structure:</span>
                            <p className="text-surface-800 dark:text-surface-200 leading-relaxed whitespace-pre-line">
                              {evalData.ideal_answer}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* ACTION PLAN & NEXT STEPS */}
      {report.improvement_plan?.length > 0 && (
        <Card className="space-y-4 p-6 bg-surface-900 text-white dark:bg-surface-900">
          <h3 className="font-bold text-base flex items-center gap-2 text-brand-400">
            <Target className="w-5 h-5" />
            Personalized Improvement Action Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {report.improvement_plan.map((step, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-800 border border-surface-700 space-y-1">
                <span className="font-bold text-brand-300">Step {i + 1}</span>
                <p className="text-surface-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}

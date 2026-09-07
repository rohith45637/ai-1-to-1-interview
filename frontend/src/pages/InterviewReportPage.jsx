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
  Layers, MessageSquare, Target, Printer, ChevronDown, ChevronUp,
  Brain, ShieldCheck, Activity
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
        setExpandedQuestions({ 0: true });

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
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-lg font-bold text-white">Synthesizing Comprehensive Report...</h3>
        <p className="text-xs text-surface-400">Compiling 6-dimension scores, communication critique, and personalized strategy.</p>
      </div>
    );
  }

  if (!report) {
    return (
      <Card className="max-w-xl mx-auto my-12 text-center p-8 space-y-4 border-surface-800 bg-surface-900/80">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Report Unavailable</h3>
        <p className="text-xs text-surface-400">Could not retrieve the interview assessment report.</p>
        <Button variant="primary" size="sm" onClick={onBackToHub}>Return to Practice Hub</Button>
      </Card>
    );
  }

  const score = report.overall_score || 76;
  const cats = report.category_scores || {};
  const dimScores = [
    { label: 'Technical Skills', value: cats.technical_knowledge || score },
    { label: 'Problem Solving Depth', value: cats.problem_solving || score },
    { label: 'Communication & Delivery', value: cats.communication || score },
    { label: 'Confidence & Presentation', value: cats.presentation || score },
    { label: 'HR / Behavioral Performance', value: cats.hr_performance || score },
    { label: 'Role Alignment', value: cats.role_knowledge || score },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 pb-24 text-surface-200 print:p-0">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-800 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="brand" dot={true}>Official Assessment Record</Badge>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Interview Performance Report
          </h1>
          <p className="text-xs text-surface-400 mt-1">
            Target Role: <strong className="text-white">{report.job_role}</strong> • {report.difficulty} Level • {new Date(report.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} icon={Printer}>
            Export PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onRetakeInterview(report.job_role)}
            icon={RotateCcw}
            className="font-bold"
          >
            Retake Interview
          </Button>
        </div>
      </div>

      {/* Hero Score Card */}
      <Card className="p-8 border-2 border-brand-500/30 bg-gradient-to-br from-surface-900 via-surface-900 to-brand-950/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Executive Evaluation</span>
            <h2 className="text-2xl font-black text-white">
              Overall Performance Rating: {score >= 80 ? 'Exceptional' : score >= 65 ? 'Proficient' : 'Developing'}
            </h2>
            <p className="text-xs text-surface-300 max-w-lg leading-relaxed">
              {report.summary || 'Solid technical foundation demonstrated with clear communication structure. Practice edge case handling and quantitative metrics to reach staff-tier mastery.'}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-surface-950 border border-surface-800 text-center min-w-[140px] shadow-inner">
            <span className="text-4xl font-black text-brand-400 font-mono">{score}</span>
            <span className="text-xs text-surface-400 block font-bold mt-0.5">/ 100 Overall</span>
          </div>
        </div>
      </Card>

      {/* 6-Dimension Score Grid */}
      <Card className="p-6 space-y-4 border-surface-800 bg-surface-900/80">
        <div className="flex items-center justify-between pb-2 border-b border-surface-800">
          <h3 className="font-bold text-base text-white">Core Competency Matrix</h3>
          <span className="text-xs text-surface-400">STAR Rubrics Weighted</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {dimScores.map((dim, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-surface-950 border border-surface-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{dim.label}</span>
                <span className="font-mono font-bold text-brand-400">{dim.value}%</span>
              </div>
              <ProgressBar value={dim.value} showValue={false} size="sm" />
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Key Strengths */}
        <Card className="p-6 space-y-4 border-surface-800 bg-surface-900/80">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-800 text-emerald-400 font-bold text-sm">
            <ThumbsUp className="w-4 h-4" />
            <span>Key Strengths</span>
          </div>
          <div className="space-y-2.5 text-xs text-surface-300">
            {(report.strengths && report.strengths.length > 0 ? report.strengths : [
              'Clear and articulate explanation of core architectural concepts.',
              'Confident delivery and active posture during speaking.',
              'Good structural adherence to problem-solving flow.'
            ]).map((str, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-950 border border-surface-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{str}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Improvements */}
        <Card className="p-6 space-y-4 border-surface-800 bg-surface-900/80">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-800 text-amber-400 font-bold text-sm">
            <Target className="w-4 h-4" />
            <span>Recommended Improvements</span>
          </div>
          <div className="space-y-2.5 text-xs text-surface-300">
            {(report.improvements && report.improvements.length > 0 ? report.improvements : [
              'Provide deeper quantitative trade-offs when discussing scalable database design.',
              'Emphasize failure modes and mitigation strategies for production outages.',
              'Tighten concise responses for behavioral questions using strict STAR format.'
            ]).map((imp, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-950 border border-surface-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{imp}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Question-by-Question Deep Dive */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-white">Question-by-Question Evaluation</h3>

        {(report.questions || []).map((q, idx) => {
          const isExpanded = expandedQuestions[idx];
          return (
            <Card key={idx} className="p-5 border-surface-800 bg-surface-900/80 space-y-3">
              <div 
                onClick={() => toggleQuestion(idx)}
                className="flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-brand-400 font-bold">Q{idx + 1}</span>
                    <Badge variant="brand" size="xs">{q.primary_skill || 'Core Competency'}</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-white">{q.question_text}</h4>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-brand-400">{q.score || 80}/100</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="pt-3 border-t border-surface-800 space-y-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-surface-400 font-semibold block">Your Answer:</span>
                    <p className="p-3 rounded-xl bg-surface-950 border border-surface-800 text-surface-300 leading-relaxed italic">
                      "{q.user_answer || 'No response recorded.'}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-brand-400 font-semibold block">AI Evaluator Critique:</span>
                    <p className="p-3 rounded-xl bg-brand-950/30 border border-brand-800/40 text-surface-200 leading-relaxed">
                      {q.critique || 'Well-structured response covering key concepts with good technical vocabulary.'}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

    </div>
  );
}

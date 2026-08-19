import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { resumesApi } from '../services/api';
import { 
  ShieldCheck, AlertCircle, CheckCircle2, TrendingUp, Sparkles, 
  ArrowRight, FileText, Target, Crosshair, HelpCircle, Layers, Zap
} from 'lucide-react';

export function AtsAnalyzerPage({ resumeData, onStartRoleInterview }) {
  const [resume, setResume] = useState(resumeData || null);
  const [loading, setLoading] = useState(!resumeData);

  useEffect(() => {
    if (!resumeData) {
      async function loadLatest() {
        try {
          const data = await resumesApi.getLatest();
          setResume(data);
        } catch (err) {
          console.warn('No resume found:', err);
        } finally {
          setLoading(false);
        }
      }
      loadLatest();
    }
  }, [resumeData]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-surface-500">Loading ATS Analysis Report...</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <Card className="max-w-2xl mx-auto my-12 text-center p-10 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-surface-900 dark:text-white">No Resume Analyzed Yet</h3>
        <p className="text-sm text-surface-500">Upload your resume first to view your ATS compatibility score and multi-role alignment.</p>
      </Card>
    );
  }

  const breakdown = resume.ats_breakdown || {};
  const roleMatches = resume.role_matches || [];
  const score = resume.ats_score || 78;

  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (val >= 65) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500';
  };

  const getScoreBadge = (val) => {
    if (val >= 80) return <Badge variant="success">ATS Optimized</Badge>;
    if (val >= 65) return <Badge variant="warning">Moderate Compatibility</Badge>;
    return <Badge variant="danger">Needs Optimization</Badge>;
  };

  const sectionCards = [
    { title: 'Structure & Layout', data: breakdown.structure_score, max: 20 },
    { title: 'Technical Skill Density', data: breakdown.skills_score, max: 25 },
    { title: 'Experience & Projects', data: breakdown.experience_score, max: 20 },
    { title: 'Format & Parseability', data: breakdown.formatting_score, max: 15 },
    { title: 'Strong Action Verbs', data: breakdown.action_verbs_score, max: 10 },
    { title: 'Quantifiable Metrics', data: breakdown.quantifiable_metrics_score, max: 10 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="brand" className="mb-2">ATS Deep Scanner</Badge>
          <h1 className="text-3xl font-black text-surface-900 dark:text-white">ATS Optimization & Multi-Role Radar</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Analyzing: <span className="font-semibold text-surface-900 dark:text-white">{resume.file_name}</span> (Version {resume.version_number})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {getScoreBadge(score)}
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Overall ATS Dial Card */}
        <Card className="lg:col-span-1 flex flex-col items-center justify-center text-center p-8 space-y-4 bg-gradient-to-b from-white to-surface-50 dark:from-surface-900 dark:to-surface-950 border-2 border-brand-500/20">
          <span className="text-xs font-bold uppercase tracking-wider text-surface-400">Overall ATS Score</span>
          
          <div className="relative flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-8 border-surface-100 dark:border-surface-800 flex items-center justify-center">
              <div className="text-center">
                <span className={'text-4xl font-black ' + getScoreColor(score)}>{score}</span>
                <span className="text-xs text-surface-400 block font-bold">/ 100</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-xs text-surface-500 max-w-xs">
            <p className="font-semibold text-surface-800 dark:text-surface-200">
              {score >= 80 ? 'High probability of passing enterprise ATS filters.' : 'Meets baseline filters, but lacks key metrics and keywords.'}
            </p>
          </div>
        </Card>

        {/* Middle/Right: Breakdown Grid */}
        <Card className="lg:col-span-2 space-y-5 p-6 sm:p-8">
          <h3 className="font-bold text-base text-surface-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            Core ATS Dimension Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sectionCards.map((sec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200/60 dark:border-surface-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-surface-900 dark:text-white">{sec.title}</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">{sec.data?.score || 0} / {sec.max}</span>
                </div>
                <ProgressBar value={sec.data?.score || 0} max={sec.max} showValue={false} color={sec.data?.score / sec.max >= 0.8 ? 'success' : 'brand'} />
                <p className="text-[11px] text-surface-500 line-clamp-2 leading-tight">{sec.data?.feedback}</p>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* STRENGTHS, CRITICAL FIXES & MISSING KEYWORDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Strengths */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-100 dark:border-surface-800 text-emerald-600 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>What Is Working Well</span>
          </div>
          <ul className="space-y-2 text-xs text-surface-700 dark:text-surface-300">
            {(breakdown.strengths || ['Clear document structure and section layout']).map((st, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Critical Fixes */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-100 dark:border-surface-800 text-rose-500 font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Recommended Fixes</span>
          </div>
          <ul className="space-y-2 text-xs text-surface-700 dark:text-surface-300">
            {(breakdown.critical_fixes || ['Add quantifiable metrics to project outcomes']).map((fx, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span>{fx}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Missing Keywords */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-100 dark:border-surface-800 text-amber-500 font-bold text-sm">
            <Zap className="w-4 h-4" />
            <span>Missing Industry Keywords</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(breakdown.missing_keywords || ['CI/CD', 'Docker', 'System Design']).map((kw, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                + {kw}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-surface-400 italic">Adding these keywords where applicable improves ATS search rankings.</p>
        </Card>

      </div>

      {/* MULTI-ROLE JOB COMPATIBILITY RADAR */}
      <Card className="space-y-6 p-6 sm:p-8">
        <div>
          <Badge variant="purple" className="mb-1.5">Multi-Role Benchmarking</Badge>
          <h3 className="text-xl font-bold text-surface-900 dark:text-white">Role Compatibility & Skill Gaps</h3>
          <p className="text-xs text-surface-500">Based on your extracted skills, here is your readiness match across industry job profiles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roleMatches.map(rm => (
            <div
              key={rm.role_id}
              className="p-5 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-surface-900 dark:text-white">{rm.role_title}</span>
                  <span className="text-sm font-black text-brand-600 dark:text-brand-400">{rm.match_percentage}%</span>
                </div>
                
                <ProgressBar value={rm.match_percentage} max={100} showValue={false} color={rm.match_percentage >= 75 ? 'success' : 'brand'} />

                {/* Matching Skills */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
                    Matching ({rm.matching_skills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {rm.matching_skills?.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                {rm.missing_skills?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-rose-500 block mb-1">
                      Gaps to Target ({rm.missing_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {rm.missing_skills.slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-surface-200/60 dark:border-surface-700/60">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs font-bold"
                  onClick={() => onStartRoleInterview(rm)}
                  icon={ArrowRight}
                >
                  Interview for this Role
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}

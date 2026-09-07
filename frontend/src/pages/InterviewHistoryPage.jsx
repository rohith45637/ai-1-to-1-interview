import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { interviewsApi } from '../services/api';
import { 
  History, Trophy, ArrowRight, Clock, AlertCircle, FileText, Bot, ChevronRight
} from 'lucide-react';

export function InterviewHistoryPage({ onViewReport, onStartPractice }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const data = await interviewsApi.getHistory();
        setHistory(data);
      } catch (err) {
        console.error('Failed to load interview history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-surface-400">Loading Interview Archives...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 pb-24 text-surface-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="brand" dot={true}>Historical Archives</Badge>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Interview History & Archives</h1>
          <p className="text-sm text-surface-400 mt-0.5">
            Review past scores, question feedback, and track your long-term consistency.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={onStartPractice} className="font-bold">
          Start New Interview
        </Button>
      </div>

      {history.length === 0 ? (
        <Card className="text-center p-12 space-y-4 border-surface-800 bg-surface-900/80">
          <History className="w-12 h-12 text-surface-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Interview History Yet</h3>
          <p className="text-xs text-surface-400 max-w-sm mx-auto">
            Complete your first 1-to-1 interview session to view detailed archived scorecards.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map(item => (
            <Card
              key={item.id}
              hover={true}
              onClick={() => onViewReport(item.id)}
              className="p-5 border-surface-800 bg-surface-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-base text-white group-hover:text-brand-400 transition-colors">
                    {item.job_role}
                  </span>
                  <Badge variant="brand" size="xs">{item.difficulty}</Badge>
                  <Badge variant="default" size="xs">{item.interview_type}</Badge>
                  <span className="text-xs text-surface-400">• {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-surface-400 flex items-center gap-4">
                  <span>Questions: <strong className="text-white">{item.total_questions}</strong></span>
                  <span>HR Ratio: <strong className="text-white">{item.hr_percentage}%</strong></span>
                  <span>Mode: <strong className="capitalize text-white">{item.mode}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className={`text-2xl font-black font-mono ${
                    (item.overall_score || 0) >= 75 ? 'text-emerald-400' : (item.overall_score || 0) >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {item.overall_score || 0}
                  </span>
                  <span className="text-xs text-surface-400 font-bold"> / 100</span>
                </div>

                <div className="p-2 rounded-xl bg-surface-800 text-surface-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}

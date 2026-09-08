import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { resumesApi } from '../services/api';
import { 
  FileUp, CheckCircle2, AlertCircle, Sparkles, FileText, ArrowRight, 
  History, User, GraduationCap, Briefcase, Code, Layers, Trash2, Eye
} from 'lucide-react';

export function ResumeUploadPage({ onStartInterviewWithResume, onNavigateToAts }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [latestResume, setLatestResume] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);

  useEffect(() => {
    loadResumeData();
  }, []);

  const loadResumeData = async () => {
    try {
      setLoadingLatest(true);
      const [latest, vList] = await Promise.allSettled([
        resumesApi.getLatest(),
        resumesApi.getVersions()
      ]);
      if (latest.status === 'fulfilled') setLatestResume(latest.value);
      if (vList.status === 'fulfilled') setVersions(vList.value);
    } catch (err) {
      console.warn('No existing resume found:', err);
    } finally {
      setLoadingLatest(false);
    }
  };

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    const allowedExtensions = ['pdf', 'docx', 'doc', 'txt'];
    const ext = selected.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      setErrorMessage(`Unsupported format (.${ext}). Please select a PDF or DOCX file.`);
      setFile(null);
      return;
    }

    // 10MB file size limit
    if (selected.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller resume document.');
      setFile(null);
      return;
    }

    setFile(selected);
    setErrorMessage('');
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      validateAndSetFile(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a valid PDF or DOCX file to upload.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(25);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(65);
      const result = await resumesApi.uploadResume(formData);
      setUploadProgress(100);

      setLatestResume(result);
      const vList = await resumesApi.getVersions();
      setVersions(vList);
      setFile(null);
    } catch (err) {
      console.error('Resume upload failed:', err);
      setErrorMessage(err.message || 'Failed to upload and parse resume document. Please check the file and try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const profile = latestResume?.parsed_data;

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 pb-24 text-surface-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="brand" dot={true}>Resume Intelligence Engine</Badge>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Upload Resume & Profile Scanner
          </h1>
          <p className="text-sm text-surface-400 mt-0.5">
            Upload your resume in PDF or DOCX format to parse technical skills, calculate ATS readiness, and generate customized interviews.
          </p>
        </div>

        {latestResume && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToAts(latestResume)}
              icon={Eye}
            >
              View ATS Scorecard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onStartInterviewWithResume(latestResume)}
              icon={Sparkles}
              className="font-bold"
            >
              Start Resume Interview
            </Button>
          </div>
        )}
      </div>

      {/* Upload Drag-and-Drop Card */}
      <Card className="border-2 border-dashed border-surface-700 hover:border-brand-500 bg-surface-900/60 p-8 sm:p-10 transition-colors">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
            <FileUp className="w-8 h-8" />
          </div>

          <div className="space-y-1 max-w-sm">
            <h3 className="text-base font-bold text-white">
              {file ? file.name : 'Drag & drop your resume document here'}
            </h3>
            <p className="text-xs text-surface-400">
              Supports PDF, DOCX (Maximum file size: 10MB)
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-xs font-semibold text-white border border-surface-700 transition-colors">
                Browse Files
              </span>
            </label>

            {file && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpload}
                loading={uploading}
                icon={Sparkles}
                className="font-bold"
              >
                Upload & Analyze
              </Button>
            )}
          </div>

          {uploading && (
            <div className="w-full max-w-xs pt-3 space-y-1.5">
              <ProgressBar value={uploadProgress} label="Extracting Technical Taxonomy..." size="sm" />
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Parsed Profile Data Section */}
      {latestResume && profile && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{profile.name || 'Candidate Profile'}</h3>
                <p className="text-xs text-surface-400">{profile.email || ''} • {profile.location || 'Location Parsed'}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-surface-400 font-semibold block">ATS Readiness</span>
              <span className="text-xl font-black text-brand-400 font-mono">
                {latestResume.ats_score || 82} / 100
              </span>
            </div>
          </div>

          {/* Grid of Parsed Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Technical Skills */}
            <Card className="p-5 space-y-3 border-surface-800 bg-surface-900/80">
              <div className="flex items-center gap-2 text-sm font-bold text-white pb-2 border-b border-surface-800">
                <Code className="w-4 h-4 text-brand-400" />
                <span>Extracted Technical Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(profile.skills || profile.technical_skills || ['React', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS']).map((sk, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-surface-800 text-surface-200 font-mono border border-surface-700/60">
                    {sk}
                  </span>
                ))}
              </div>
            </Card>

            {/* Target Job Roles */}
            <Card className="p-5 space-y-3 border-surface-800 bg-surface-900/80">
              <div className="flex items-center gap-2 text-sm font-bold text-white pb-2 border-b border-surface-800">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>Matched Target Roles</span>
              </div>
              <div className="space-y-2 pt-1">
                {(profile.job_roles || ['Full Stack Developer', 'Backend Engineer', 'Software Architect']).map((role, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-surface-950/60 border border-surface-800 text-xs">
                    <span className="font-semibold text-white">{role}</span>
                    <Badge variant="brand" size="xs">Aligned</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
}

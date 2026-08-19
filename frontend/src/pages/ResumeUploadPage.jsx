import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { resumesApi } from '../services/api';
import { 
  FileUp, CheckCircle2, AlertCircle, Sparkles, FileText, ArrowRight, 
  History, User, GraduationCap, Briefcase, Code
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

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setErrorMessage('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please choose a PDF or DOCX file to upload.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(20);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(55);
      const result = await resumesApi.uploadResume(formData);
      setUploadProgress(100);

      setLatestResume(result);
      const vList = await resumesApi.getVersions();
      setVersions(vList);
      setFile(null);
    } catch (err) {
      console.error('Resume upload failed:', err);
      setErrorMessage(err.message || 'Failed to parse resume. Please try a different document.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const profile = latestResume?.parsed_data;

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 pb-20">
      <div>
        <Badge variant="brand" className="mb-2">Resume Intelligence</Badge>
        <h1 className="text-3xl font-black text-surface-900 dark:text-white">Upload Resume & Structured Profile</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Upload your resume in PDF or DOCX format. The AI extracts your technical taxonomy, scores ATS readiness, and plans your personalized interview.
        </p>
      </div>

      <Card className="border-2 border-dashed border-surface-300 dark:border-surface-700 hover:border-brand-500 dark:hover:border-brand-500 transition-colors p-8 sm:p-10">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center text-center space-y-4 cursor-pointer"
          onClick={() => document.getElementById('resume-file-input').click()}
        >
          <input
            id="resume-file-input"
            type="file"
            accept=".pdf,.docx,.doc"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800 shadow-sm">
            <FileUp className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-base text-surface-900 dark:text-white">
              {file ? file.name : 'Click to select or drag and drop your resume'}
            </h3>
            <p className="text-xs text-surface-500">Supported formats: PDF, DOCX, DOC (Up to 10MB)</p>
          </div>

          {file && (
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-3 py-1.5 rounded-full border border-brand-200 dark:border-brand-800">
              <FileText className="w-3.5 h-3.5" />
              <span>Ready: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {uploading && (
          <div className="mt-6 space-y-2">
            <ProgressBar value={uploadProgress} label="Extracting skills, projects, and ATS metrics with Gemini..." />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          {file && (
            <Button
              variant="outline"
              size="md"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            loading={uploading}
            onClick={(e) => { e.stopPropagation(); handleUpload(); }}
            disabled={!file}
            icon={Sparkles}
          >
            Parse Resume with AI
          </Button>
        </div>
      </Card>

      {latestResume && profile && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-brand-600/20">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resume V{latestResume.version_number} Active</span>
              </div>
              <h3 className="text-xl font-black">Ready for Your Tailored Interview</h3>
              <p className="text-xs text-white/80">ATS Score: {latestResume.ats_score}/100 • {profile.skills?.length || 0} Skills Detected</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => onNavigateToAts(latestResume)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
              >
                View Full ATS Report
              </Button>
              <Button
                variant="primary"
                onClick={() => onStartInterviewWithResume(latestResume)}
                className="bg-white hover:bg-white/90 text-brand-700 font-black text-xs shadow-md"
                icon={ArrowRight}
              >
                Start Resume Interview
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Card className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-surface-100 dark:border-surface-800 text-surface-900 dark:text-white font-bold text-sm">
                <User className="w-4 h-4 text-brand-500" />
                <span>Candidate Details</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-surface-400 block">Name</span>
                  <span className="font-bold text-surface-900 dark:text-white text-sm">{profile.name || 'Candidate'}</span>
                </div>
                <div>
                  <span className="text-surface-400 block">Email</span>
                  <span className="text-surface-700 dark:text-surface-300 font-medium">{profile.email || 'candidate@example.com'}</span>
                </div>
                {profile.phone && (
                  <div>
                    <span className="text-surface-400 block">Phone</span>
                    <span className="text-surface-700 dark:text-surface-300 font-medium">{profile.phone}</span>
                  </div>
                )}
              </div>

              {profile.education?.length > 0 && (
                <div className="pt-3 border-t border-surface-100 dark:border-surface-800 space-y-2">
                  <span className="text-xs font-bold text-surface-900 dark:text-white flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    Education
                  </span>
                  {profile.education.map((edu, idx) => (
                    <div key={idx} className="text-xs space-y-0.5">
                      <span className="font-semibold text-surface-900 dark:text-white block">{edu.degree || edu.field_of_study}</span>
                      <span className="text-surface-500">{edu.institution} ({edu.year})</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="md:col-span-2 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-surface-100 dark:border-surface-800 text-surface-900 dark:text-white font-bold text-sm">
                <Code className="w-4 h-4 text-brand-500" />
                <span>Extracted Technical Competencies ({profile.skills?.length || 0})</span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block mb-1.5">Core Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills?.map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {profile.tools?.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block mb-1.5">Tools & Platforms</span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.tools.map(tool => (
                        <span key={tool} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {profile.projects?.length > 0 && (
                <div className="pt-3 border-t border-surface-100 dark:border-surface-800 space-y-2">
                  <span className="text-xs font-bold text-surface-900 dark:text-white flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    Key Projects Identified
                  </span>
                  <div className="space-y-2">
                    {profile.projects.slice(0, 2).map((proj, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200/60 dark:border-surface-800 text-xs space-y-1">
                        <div className="font-bold text-surface-900 dark:text-white">{proj.title}</div>
                        <p className="text-surface-500 line-clamp-2">{proj.description}</p>
                        {proj.technologies && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies.map(t => (
                              <span key={t} className="text-[10px] bg-brand-100/60 dark:bg-brand-950 text-brand-600 dark:text-brand-400 px-1.5 py-0.2 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

          </div>

          {versions.length > 1 && (
            <Card className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-surface-100 dark:border-surface-800 font-bold text-sm text-surface-900 dark:text-white">
                <History className="w-4 h-4 text-amber-500" />
                <span>Resume Version History & ATS Progression</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-800 text-surface-400 font-bold uppercase tracking-wider">
                      <th className="py-2 px-3">Version</th>
                      <th className="py-2 px-3">File Name</th>
                      <th className="py-2 px-3">ATS Score</th>
                      <th className="py-2 px-3">Skills Count</th>
                      <th className="py-2 px-3">Uploaded Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {versions.map(ver => (
                      <tr key={ver.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-surface-900 dark:text-white">
                          <span className="bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded font-mono">
                            V{ver.version_number}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-surface-700 dark:text-surface-300 font-medium">{ver.file_name}</td>
                        <td className="py-2.5 px-3 font-black text-emerald-600 dark:text-emerald-400">{ver.ats_score}/100</td>
                        <td className="py-2.5 px-3 text-surface-500">{ver.skills_count} skills</td>
                        <td className="py-2.5 px-3 text-surface-400">{new Date(ver.uploaded_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

        </div>
      )}

    </div>
  );
}

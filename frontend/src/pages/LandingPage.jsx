import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { rolesApi } from '../services/api';
import { 
  FileUp, Sparkles, Bot, CheckCircle2, 
  ArrowRight, Layers, Search, Mic, Video, 
  BarChart3, Brain, Shield, ChevronRight, Zap
} from 'lucide-react';

export function LandingPage({ onStartDirectInterview, onNavigateToResume, onNavigateToWeakSkills }) {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function loadRoles() {
      try {
        const data = await rolesApi.getRoles();
        setRoles(data);
        if (data.length > 0) setSelectedRole(data[0]);
      } catch (err) {
        console.error('Failed to load roles:', err);
      } finally {
        setLoadingRoles(false);
      }
    }
    loadRoles();
  }, []);

  const categories = ['All', 'Software Engineering', 'Data & AI', 'Security & Cloud', 'Design & Product', 'Infrastructure'];

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (role.core_technical_skills && role.core_technical_skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCat = selectedCategory === 'All' || role.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const capabilities = [
    {
      icon: Bot,
      title: 'AI 1-to-1 Interviewer',
      description: 'Dynamic conversational AI that asks contextual questions, probes technical depth, and provides realistic pushback.'
    },
    {
      icon: Mic,
      title: 'Real-time Voice Interaction',
      description: 'Zero-lag natural speech recognition with realistic pacing, Indian English accents, and hands-free auto-submission.'
    },
    {
      icon: FileUp,
      title: 'Resume ATS Analysis',
      description: 'Extracts skills taxonomy, detects gaps, and tests you specifically on claimed past projects and experience.'
    },
    {
      icon: Video,
      title: 'Presentation & Body Language',
      description: 'Real-time optical analysis tracking eye contact, posture stability, clarity, and pacing.'
    },
    {
      icon: BarChart3,
      title: 'Personalized Scorecard',
      description: 'Comprehensive 6-dimension evaluation with STAR method critique and question-by-question ideal responses.'
    },
    {
      icon: Zap,
      title: 'Targeted Weak-Skill Drills',
      description: 'Isolates concepts where you scored under 72% and automatically builds focused adaptive practice rounds.'
    }
  ];

  return (
    <div className="space-y-16 py-6 pb-20">
      
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-600/15 via-surface-900/60 to-surface-950 border border-brand-500/20 p-8 sm:p-14 text-center shadow-2xl">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold border border-brand-500/30 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span>Next-Generation AI Interview Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
            Practice Smarter.<br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-accent-500 bg-clip-text text-transparent">
              Interview Better.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-surface-300 max-w-2xl mx-auto font-normal leading-relaxed">
            An AI-powered 1-to-1 mock interview platform that evaluates your answers, communication, and presentation skills in real time.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onStartDirectInterview({ title: 'Full Stack Developer' })}
              icon={Sparkles}
              className="w-full sm:w-auto font-bold shadow-xl shadow-brand-500/25"
            >
              Start Interview
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={onNavigateToResume}
              icon={FileUp}
              className="w-full sm:w-auto font-bold"
            >
              Analyze My Resume
            </Button>
          </div>

          {/* Key Stat Badges */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-surface-900/80 border border-surface-800 backdrop-blur-md">
              <div className="text-2xl font-black text-brand-400">20+</div>
              <div className="text-xs text-surface-400 font-medium">Curated Tech Roles</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-900/80 border border-surface-800 backdrop-blur-md">
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-xs text-surface-400 font-medium">Real-time Voice STT</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-900/80 border border-surface-800 backdrop-blur-md">
              <div className="text-2xl font-black text-indigo-400">6-Dim</div>
              <div className="text-xs text-surface-400 font-medium">Assessment Rubrics</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-900/80 border border-surface-800 backdrop-blur-md">
              <div className="text-2xl font-black text-amber-400">ATS</div>
              <div className="text-xs text-surface-400 font-medium">Resume Match Radar</div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* CAPABILITIES SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="brand" dot={true}>Core Capabilities</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Real Interview Mastery</h2>
          <p className="text-xs sm:text-sm text-surface-400">Every layer of the platform is designed to simulate authentic hiring loops.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <Card key={idx} hover={true} className="space-y-3 p-6 border-surface-800 bg-surface-900/70">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">{cap.title}</h3>
                <p className="text-xs text-surface-400 leading-relaxed">{cap.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* TWO PRIMARY PATHWAYS */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Choose Your Interview Pathway</h2>
          <p className="text-xs sm:text-sm text-surface-400">Launch from your uploaded resume or jump directly into a curated job role.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pathway 1: Resume Deep Dive */}
          <Card hover={true} className="p-8 border-2 border-brand-500/30 bg-gradient-to-br from-surface-900 via-surface-900 to-brand-950/40 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="brand" size="sm">Option 1 • Tailored</Badge>
                <span className="text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                  Recommended
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shrink-0">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Interview from My Resume</h3>
                  <p className="text-xs text-surface-300 mt-1 leading-relaxed">
                    Upload your PDF/DOCX resume. The AI will parse your technical skills, work history, and past projects to generate authentic, personalized behavioral and technical questions.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-surface-300 pt-2 border-t border-surface-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Deep-dive into your actual projects & claimed tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Identifies resume discrepancies & test depth</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full ATS compatibility report included</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={onNavigateToResume}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full font-bold"
            >
              Upload Resume & Start
            </Button>
          </Card>

          {/* Pathway 2: Direct Curated Roles */}
          <Card hover={true} className="p-8 border border-surface-800 bg-surface-900/80 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="default" size="sm">Option 2 • Instant</Badge>
                <span className="text-[11px] font-bold text-surface-400">20+ Roles Available</span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Select a Curated Job Role</h3>
                  <p className="text-xs text-surface-300 mt-1 leading-relaxed">
                    Pick from software engineering, data science, AI engineering, cybersecurity, DevOps, cloud, and product management tracks.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-surface-300 pt-2 border-t border-surface-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standardized industry hiring rubrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Select Beginner to Principal difficulty tiers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Choose Mixed, Technical-only, or HR formats</span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={() => onStartDirectInterview({ title: 'Full Stack Developer' })}
              icon={Sparkles}
              className="w-full font-bold"
            >
              Browse Roles Below & Launch
            </Button>
          </Card>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* CURATED JOB ROLES CATALOG WITH FILTER & SEARCH */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Curated Role Library</h2>
            <p className="text-xs text-surface-400 mt-0.5">Select a role below to configure your tailored interview session.</p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search roles or skills (e.g. Python, React)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-surface-900 border border-surface-800 text-xs text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm border border-brand-400/30'
                  : 'bg-surface-900/80 text-surface-400 hover:text-white hover:bg-surface-800 border border-surface-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Role Cards Grid */}
        {loadingRoles ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-surface-400">Loading interview role profiles...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="py-12 text-center text-xs text-surface-400 bg-surface-900/40 rounded-2xl border border-surface-800">
            No job roles matched "{searchTerm}". Try a different search term.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => (
              <Card
                key={role.id || role.title}
                hover={true}
                onClick={() => onStartDirectInterview(role)}
                className="p-5 border-surface-800 bg-surface-900/80 flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-brand-400 transition-colors">
                        {role.title}
                      </h3>
                      <span className="text-[11px] text-surface-400">{role.category}</span>
                    </div>
                    <Badge variant="brand" size="xs">Ready</Badge>
                  </div>

                  <p className="text-xs text-surface-300 line-clamp-2 leading-relaxed">
                    {role.description || `Comprehensive mock interview testing ${role.title} architecture, debugging, and behavioral competencies.`}
                  </p>

                  {/* Skills preview */}
                  {role.core_technical_skills && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {role.core_technical_skills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-surface-800 text-surface-300 font-mono">
                          {skill}
                        </span>
                      ))}
                      {role.core_technical_skills.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-surface-500">
                          +{role.core_technical_skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-surface-800/80 flex items-center justify-between text-xs text-brand-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Start Interview</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

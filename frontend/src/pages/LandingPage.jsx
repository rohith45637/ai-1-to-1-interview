import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { rolesApi } from '../services/api';
import { 
  FileUp, Sparkles, Bot, CheckCircle2, 
  ArrowRight, Layers, Search
} from 'lucide-react';

export function LandingPage({ onStartDirectInterview, onNavigateToResume }) {
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
      role.core_technical_skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || role.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-16 py-6 pb-20">
      
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-500/10 via-surface-100/50 to-transparent dark:from-brand-950/40 dark:via-surface-900/20 dark:to-transparent border border-brand-200/50 dark:border-brand-900/30 p-8 sm:p-12 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen 1-to-1 AI Interview Preparation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-surface-900 dark:text-white leading-[1.15]">
            Ace Your Next Interview with <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">Realistic AI</span>
          </h1>

          <p className="text-base sm:text-lg text-surface-600 dark:text-surface-300 max-w-2xl mx-auto font-normal">
            Experience a true 1-to-1 interview simulator that parses your resume, tests your depth with adaptive follow-ups, analyzes communication via STAR metrics, and isolates your weak concepts.
          </p>

          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="p-3 rounded-xl bg-white/70 dark:bg-surface-900/70 border border-surface-200 dark:border-surface-800">
              <div className="text-2xl font-black text-brand-600 dark:text-brand-400">20+</div>
              <div className="text-xs text-surface-500 font-medium">Job Roles Ready</div>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-surface-900/70 border border-surface-200 dark:border-surface-800">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs text-surface-500 font-medium">Adaptive Rubrics</div>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-surface-900/70 border border-surface-200 dark:border-surface-800">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">6-Dim</div>
              <div className="text-xs text-surface-500 font-medium">Score Matrix</div>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-surface-900/70 border border-surface-200 dark:border-surface-800">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">ATS</div>
              <div className="text-xs text-surface-500 font-medium">Resume Matching</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white">Choose Your Interview Experience</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Start from your uploaded resume or jump directly into a curated job role.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <Card className="relative overflow-hidden border-2 border-brand-500/30 hover:border-brand-500 bg-gradient-to-br from-white via-white to-brand-50/40 dark:from-surface-900 dark:via-surface-900 dark:to-brand-950/30 transition-all shadow-lg p-8 flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="brand" size="md" className="text-xs font-bold uppercase tracking-wider">
                  Option 1
                </Badge>
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-full border border-brand-200 dark:border-brand-800">
                  Most Recommended
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FileUp className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-surface-900 dark:text-white">Resume-Based Interview</h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                    Upload your PDF, DOC, or DOCX resume. The AI will extract your tech stack, projects, and past experience to conduct an authentically tailored interview.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-surface-100 dark:border-surface-800/80 text-sm text-surface-700 dark:text-surface-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Automatic skills & project taxonomy extraction</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>0-100 ATS Compatibility & Multi-Role Scoring</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Deep-dive questions into your specific tech stack</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Version comparisons: Track ATS score across revisions</span>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-6">
              <Button
                size="lg"
                variant="primary"
                onClick={onNavigateToResume}
                className="w-full font-bold shadow-md shadow-brand-500/20"
                icon={ArrowRight}
              >
                Upload Resume & Start
              </Button>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-2 border-surface-200 dark:border-surface-800 hover:border-indigo-500 bg-gradient-to-br from-white via-white to-indigo-50/40 dark:from-surface-900 dark:via-surface-900 dark:to-indigo-950/30 transition-all shadow-lg p-8 flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="purple" size="md" className="text-xs font-bold uppercase tracking-wider">
                  Option 2
                </Badge>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Instant Practice
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-surface-900 dark:text-white">Direct Role-Based Interview</h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                    Pick from 20+ trending job roles. Customize difficulty (Beginner to Expert), HR question percentage (0% to 50%), and practice instant feedback.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-surface-100 dark:border-surface-800/80 text-sm text-surface-700 dark:text-surface-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span>20+ pre-configured industry job profiles</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span>Configurable HR/Behavioral percentage slider</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span>Real Interview Mode vs Instant Practice Mode</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span>Voice STT / TTS speech integration with fallback</span>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-6">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  const target = selectedRole || (roles.length > 0 ? roles[0] : { title: 'Full Stack Developer', id: 'full-stack-developer' });
                  onStartDirectInterview(target);
                }}
                className="w-full font-bold bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
                icon={ArrowRight}
              >
                Select Role & Configure
              </Button>
            </div>
          </Card>

        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-500" />
              Explore 20+ Trending Job Roles
            </h3>
            <p className="text-xs text-surface-500">Click any role below to customize and launch an interview instantly.</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search roles or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-xs text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={'px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ' + (selectedCategory === cat ? 'bg-brand-600 text-white shadow-sm' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700')}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRoles.map(role => (
            <div
              key={role.id}
              onClick={() => onStartDirectInterview(role)}
              className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-brand-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                    {role.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-surface-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="font-bold text-sm text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {role.title}
                </h4>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 line-clamp-2 leading-relaxed">
                  {role.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-surface-100 dark:border-surface-800/80 flex flex-wrap gap-1">
                {role.core_technical_skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-[10px] bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 px-1.5 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
                {role.core_technical_skills.length > 3 && (
                  <span className="text-[10px] text-surface-400 self-center pl-1">
                    +{role.core_technical_skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="text-center mb-10">
          <Badge variant="brand" className="mb-2">Intelligent Workflow</Badge>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white">How 1-to-1 Interview Works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-black text-lg flex items-center justify-center mx-auto border border-brand-200 dark:border-brand-800">
              1
            </div>
            <h4 className="font-bold text-base text-surface-900 dark:text-white">Profile & Config</h4>
            <p className="text-xs text-surface-500 leading-relaxed">Upload your resume or pick from 20+ roles. Select difficulty and HR percentage.</p>
          </Card>

          <Card className="text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-lg flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800">
              2
            </div>
            <h4 className="font-bold text-base text-surface-900 dark:text-white">1-to-1 Interview</h4>
            <p className="text-xs text-surface-500 leading-relaxed">Answer through Voice or Text. AI asks one question at a time and probes with follow-ups.</p>
          </Card>

          <Card className="text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black text-lg flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              3
            </div>
            <h4 className="font-bold text-base text-surface-900 dark:text-white">Multi-Rubric Evaluation</h4>
            <p className="text-xs text-surface-500 leading-relaxed">Get evaluated on Correctness, Technical Depth, STAR Structure, and Ideal Answers.</p>
          </Card>

          <Card className="text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-black text-lg flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
              4
            </div>
            <h4 className="font-bold text-base text-surface-900 dark:text-white">Adaptive Mastery</h4>
            <p className="text-xs text-surface-500 leading-relaxed">AI automatically detects weak skills (e.g. SQL JOINs) and targets them in next sessions.</p>
          </Card>
        </div>
      </section>

    </div>
  );
}

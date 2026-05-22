'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudy } from '../../context/StudyContext';
import Sidebar from '../../components/Sidebar';
import PomodoroTimer from '../../components/PomodoroTimer';
import * as Icons from 'lucide-react';

// Helper component to render Lucide Icons dynamically from database strings
const DynamicIcon = ({ name, className, size = 18, style }: { name: string; className?: string; size?: number; style?: React.CSSProperties }) => {
  const IconComponent = (Icons as any)[name] || Icons.BookOpen;
  return <IconComponent className={className} size={size} style={style} />;
};

export default function DashboardPage() {
  const router = useRouter();
  const { 
    user, 
    subjects, 
    tasks, 
    notes, 
    flashcards, 
    leaderboard, 
    theme, 
    setTheme, 
    completeTask,
    pomodoros,
    quizzes
  } = useStudy();

  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [quickPersona, setQuickPersona] = useState<'none' | 'socratic' | 'explain5' | 'expertDev'>('none');

  // Compute calculated statistics
  const todayStr = new Date().toISOString().split('T')[0];
  
  const focusMinutesToday = pomodoros
    .filter(p => p.date === todayStr && p.type === 'focus')
    .reduce((acc, curr) => acc + curr.duration, 0);

  const completedQuizzesCount = quizzes.length;
  const averageQuizScore = quizzes.length > 0 
    ? Math.round((quizzes.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / quizzes.length) * 100) 
    : 0;

  const activeCardsDue = flashcards.filter(c => c.nextReviewDate <= todayStr).length;

  // Determine time-sensitive greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Launch AI Workspace directly from search prompt
  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchQuery.trim()) return;
    
    // Redirect to chat workspace, passing prompt values
    router.push(`/workspace?prompt=${encodeURIComponent(quickSearchQuery)}&persona=${quickPersona}`);
  };

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      
      {/* 1. App Navigation Shell */}
      <Sidebar />

      {/* 2. Scrollable Dashboard Core */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        
        {/* Dynamic decorative backdrop rings */}
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none animate-pulse-glow" />

        {/* Premium Header toolbar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/5 mb-8 relative z-20">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Study Command
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">AURA V1.2</span>
            </h1>
            <p className="text-xs text-text-muted">Master your academic modules and cognitive memory streams.</p>
          </div>

          {/* Theme Color selector dashboard */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">UI Aesthetic:</span>
            <div className="flex items-center bg-white/5 border border-color rounded-xl p-1 gap-1">
              {([
                { id: 'midnight', name: 'Midnight', color: 'bg-indigo-500' },
                { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
                { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-purple-500' },
                { id: 'rosegold', name: 'Rose Gold', color: 'bg-rose-300' }
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 capitalize
                    ${theme === t.id 
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/30' 
                      : 'text-text-muted hover:text-white'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${t.color}`} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Dashboard 3-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-10">
          
          {/* Main left and center Content columns (Span 2) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Dynamic Greeting Hero Jumbotron */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/15 via-cyan-500/5 to-transparent border border-indigo-500/10 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-black text-white leading-tight">
                  {getGreeting()}, {user.name} <span className="animate-bounce inline-block">👋</span>
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  Your daily streak multiplier is holding steady. Review your due spaced-repetition flashcards to secure today's cognitive retention.
                </p>
              </div>
              <button 
                onClick={() => router.push('/workspace')}
                className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-102 transition-transform font-bold text-white text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Icons.Sparkles size={14} />
                Ask AI tutor
              </button>
            </div>

            {/* Quick Metrics Dashboard dials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Today's XP", value: `${user.xp} / 1000`, sub: "Weekly goal: 5K", icon: Icons.Zap, color: "text-yellow-400 bg-yellow-500/5 border-yellow-500/10" },
                { label: "Focus Work", value: `${focusMinutesToday} Min`, sub: "Logged today", icon: Icons.Clock, color: "text-cyan-400 bg-cyan-500/5 border-cyan-500/10" },
                { label: "Quiz Accuracy", value: `${averageQuizScore}%`, sub: `${completedQuizzesCount} Quizzes taken`, icon: Icons.Award, color: "text-pink-400 bg-pink-500/5 border-pink-500/10" },
                { label: "Memory Cards", value: `${activeCardsDue} Due`, sub: `${flashcards.length} Total active`, icon: Icons.Layers, color: "text-indigo-400 bg-indigo-500/5 border-indigo-500/10" }
              ].map((metric, i) => {
                const MetricIcon = metric.icon;
                return (
                  <div key={i} className={`p-4 rounded-2xl border ${metric.color} flex flex-col justify-between h-28`}>
                    <div className="flex justify-between items-center text-text-muted">
                      <span className="text-[10px] font-bold uppercase">{metric.label}</span>
                      <MetricIcon size={14} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-lg font-black text-white">{metric.value}</h4>
                      <p className="text-[9px] text-text-muted truncate">{metric.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Doubt-Solver Quick Portal */}
            <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                <Icons.Bot size={16} className="text-indigo-400" />
                Quick AI Doubts solver
              </h3>
              
              <form onSubmit={handleQuickSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter academic topic or coding bug..."
                    value={quickSearchQuery}
                    onChange={(e) => setQuickSearchQuery(e.target.value)}
                    className="w-full text-xs font-semibold p-3.5 rounded-xl bg-white/5 border border-color focus:border-indigo-500/55 pl-10 text-white placeholder-text-muted"
                  />
                  <Icons.Search size={14} className="absolute left-3.5 top-4.5 text-text-muted" />
                </div>
                
                {/* Persona selector options */}
                <select
                  value={quickPersona}
                  onChange={(e) => setQuickPersona(e.target.value as any)}
                  className="px-3 py-3 rounded-xl bg-white/5 border border-color text-xs font-bold text-text-muted"
                >
                  <option value="none">Standard Tutor</option>
                  <option value="socratic">Socratic Tutor</option>
                  <option value="explain5">Explain like I'm 5</option>
                  <option value="expertDev">Staff Developer</option>
                </select>

                <button
                  type="submit"
                  className="py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Icons.Sparkles size={14} />
                  Solve
                </button>
              </form>
            </div>

            {/* Subject Organizer Panels Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Icons.FolderOpen size={16} className="text-cyan-400" />
                  Subject Organizer
                </h3>
                <button 
                  onClick={() => router.push('/settings')}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                >
                  + Add subject
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map(subject => {
                  const subjectNotesCount = notes.filter(n => n.subjectId === subject.id).length;
                  const subjectCardsCount = flashcards.filter(f => f.subjectId === subject.id).length;
                  
                  return (
                    <div 
                      key={subject.id}
                      onClick={() => router.push(`/workspace?subject=${subject.id}`)}
                      className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 hover:scale-[1.01] transition-transform cursor-pointer relative overflow-hidden group"
                    >
                      {/* Decorative colored glow strip */}
                      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: subject.color }} />
                      
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/15 transition-colors">
                          <DynamicIcon name={subject.icon} style={{ color: subject.color }} />
                        </div>
                        <span className="text-[10px] font-bold text-text-muted bg-white/5 px-2 py-0.5 rounded-full border border-color">
                          {subject.xp} XP
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-base truncate group-hover:text-indigo-300 transition-colors">{subject.name}</h4>
                        <div className="flex items-center gap-2.5 text-[10px] text-text-muted">
                          <span>{subjectNotesCount} Notes</span>
                          <span>•</span>
                          <span>{subjectCardsCount} Flashcards</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Leitner Repetition Cards due today */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                <Icons.Layers size={16} className="text-pink-400" />
                Spaced Revision Due Today
              </h3>
              
              {activeCardsDue > 0 ? (
                <div className="p-5 rounded-2xl bg-pink-500/5 border border-pink-500/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">Spaced Memory Cards Awaiting!</h4>
                    <p className="text-[11px] text-text-muted">
                      There are **{activeCardsDue} memory cards** scheduled for spaced review using the Leitner box interval method.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/quiz?tab=flashcards')}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 font-bold text-white text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Start Review
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-white/5 border border-color text-center py-6 text-text-muted text-xs">
                  ✨ Perfect alignment! No memory items are scheduled for review today. You're fully locked in!
                </div>
              )}
            </div>
          </div>

          {/* Right widgets column (Span 1) */}
          <div className="space-y-6">
            
            {/* Competitive Arena leaderboard */}
            <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Icons.Users2 size={16} className="text-indigo-400" />
                  Duolingo Study Arena
                </h3>
                <span className="text-[9px] font-bold text-orange-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                  LIVE COMPETITION
                </span>
              </div>

              <div className="space-y-2">
                {leaderboard.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors
                      ${item.isUser 
                        ? 'bg-indigo-600/15 border-indigo-500/25 shadow-sm' 
                        : 'bg-white/5 border-transparent'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-text-muted w-3">{idx + 1}</span>
                      <span className="text-lg shrink-0 select-none">{item.avatar}</span>
                      <div className="min-w-0">
                        <h5 className={`text-xs font-bold truncate ${item.isUser ? 'text-white font-extrabold' : 'text-text-primary'}`}>
                          {item.name}
                        </h5>
                        <p className="text-[9px] text-text-muted">Level {item.level} • {item.streak}d streak</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-indigo-400 pr-1">{item.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spaced Daily Task board Checklist */}
            <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                <Icons.CheckSquare size={16} className="text-cyan-400" />
                Active daily Tasks
              </h3>

              <div className="space-y-2">
                {tasks.filter(t => !t.completed).slice(0, 4).length > 0 ? (
                  tasks.filter(t => !t.completed).slice(0, 4).map(task => (
                    <div 
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-transparent hover:border-white/5 transition-colors group"
                    >
                      <button
                        onClick={() => completeTask(task.id)}
                        className="w-4.5 h-4.5 rounded-md border border-color hover:border-indigo-400 flex items-center justify-center shrink-0 cursor-pointer mt-0.5 text-transparent hover:text-indigo-400 transition-colors"
                      >
                        <Icons.Check size={12} strokeWidth={3} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-semibold text-text-primary group-hover:text-indigo-300 transition-colors leading-normal truncate">{task.title}</h5>
                        <div className="flex items-center gap-2 text-[9px] text-text-muted mt-1">
                          <span className="text-indigo-400 font-bold">+{50 + task.estimatedPomodoros * 15} XP</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Icons.Timer size={9} />
                            {task.completedPomodoros} / {task.estimatedPomodoros} Pomo
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-text-muted text-xs">
                    🌟 All tasks completed! Ready for some deep learning?
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => router.push('/planner')}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-color text-text-muted hover:text-white text-xs font-bold transition-all text-center block cursor-pointer"
              >
                Manage Calendar Board
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Pomodoro Widget (accessible on dashboard overlay) */}
      <PomodoroTimer />
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStudy } from '../../context/StudyContext';
import Sidebar from '../../components/Sidebar';
import PomodoroTimer from '../../components/PomodoroTimer';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Clock, 
  Award, 
  ShieldAlert, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, subjects, pomodoros, quizzes, theme } = useStudy();

  // 1. Prepare Mock Chart Data (Weekly study hours trend)
  const studyHoursData = [
    { name: 'Mon', hours: 2.5 },
    { name: 'Tue', hours: 4.0 },
    { name: 'Wed', hours: 1.5 },
    { name: 'Thu', hours: 3.2 },
    { name: 'Fri', hours: 5.0 }, // Peak study day!
    { name: 'Sat', hours: 2.0 },
    { name: 'Sun', hours: 1.0 }
  ];

  // 2. Prepare Cumulative XP Data (Line Graph trend)
  const xpGrowthData = [
    { day: 'Mon', xp: 800 },
    { day: 'Tue', xp: 1200 },
    { day: 'Wed', xp: 1400 },
    { day: 'Thu', xp: 1850 },
    { day: 'Fri', xp: 2450 },
    { day: 'Sat', xp: 2650 },
    { day: 'Sun', xp: 2800 }
  ];

  // 3. Subject distribution chart data
  const subjectDistributionData = subjects.map(s => ({
    name: s.name.substring(0, 10) + '...',
    value: s.xp,
    color: s.color
  }));

  // 4. Heuristic Weak Topics Diagnostic
  // Find subjects with quizzes, compile averages, flag low scores
  const compileDiagnostics = () => {
    const diagnosticsList = [];
    
    // Check Neural networks module
    const aiQuiz = quizzes.filter(q => q.subjectId === 'sub-1');
    const aiAvg = aiQuiz.length > 0 ? (aiQuiz.reduce((acc, c) => acc + (c.score / c.totalQuestions), 0) / aiQuiz.length) * 100 : 85;
    
    // Check Algorithms
    const algoQuiz = quizzes.filter(q => q.subjectId === 'sub-2');
    const algoAvg = algoQuiz.length > 0 ? (algoQuiz.reduce((acc, c) => acc + (c.score / c.totalQuestions), 0) / algoQuiz.length) * 100 : 55; // Low!
    
    if (algoAvg < 70) {
      diagnosticsList.push({
        subjectId: 'sub-2',
        subjectName: 'Advanced Algorithms',
        score: algoAvg,
        reason: 'Time complexities of partition matrices and quicksort splits are dragging down scores.',
        recommendation: "Review ' quicKsort partition logics ' note, utilize Socratic Persona in chat, and take a 3-question MCQ quiz."
      });
    }

    // Default general diagnosis if algos look clean
    if (diagnosticsList.length === 0) {
      diagnosticsList.push({
        subjectId: 'sub-3',
        subjectName: 'UX/UI Design Systems',
        score: 65,
        reason: 'Failing to identify correct Spaced Repetition Box timings.',
        recommendation: "Generate a summary from 'Spaced Repetition & Spacing Effect' note to reinforce Leitner frequency schedules."
      });
    }

    return diagnosticsList;
  };

  const diagnostics = compileDiagnostics();

  // Circle SVG metrics for circular level gauge
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (user.xp / 1000) * circumference;

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      
      {/* Navigation shell */}
      <Sidebar />

      {/* Main Analytics Canvas */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none animate-pulse-glow" />

        {/* Header */}
        <header className="pb-6 border-b border-white/5 mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Study Analytics & Analytics Diagnostics
          </h1>
          <p className="text-xs text-text-muted">Track your cognitive metrics, study hours distribution, and diagnostic weak modules.</p>
        </header>

        {/* Outer layouts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          
          {/* Main Chart Column (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Visual Charts panel 1: Weekly focus hours */}
            <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                <Clock size={16} className="text-cyan-400" />
                Focus Distribution (Hours / Day)
              </h3>
              
              <div className="w-full h-64 bg-black/10 rounded-2xl p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyHoursData}>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} unit="h" />
                    <Tooltip 
                      contentStyle={{ background: '#0f1626', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Bar dataKey="hours" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Visual Charts panel 2: Glowing XP Growth Line Graph */}
            <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-400" />
                XP Accumulator Trend
              </h3>

              <div className="w-full h-64 bg-black/10 rounded-2xl p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={xpGrowthData}>
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0f1626', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="xp" 
                      stroke="var(--accent)" 
                      strokeWidth={3} 
                      dot={{ r: 4, stroke: 'var(--accent)', strokeWidth: 2, fill: '#080c14' }}
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Right widgets diagnostics column (Span 1) */}
          <div className="space-y-6">
            
            {/* XP circular Progress Dial Card */}
            <div className="glass-panel border border-color rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Cognitive Level</span>
              
              <div className="relative flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle 
                    cx="72" cy="72" r={radius} 
                    className="stroke-white/5 fill-none" 
                    strokeWidth="7" 
                  />
                  <circle 
                    cx="72" cy="72" r={radius} 
                    className="stroke-indigo-500 fill-none transition-all duration-500" 
                    strokeWidth="7" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ stroke: 'var(--primary)' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white leading-none">{user.level}</span>
                  <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase mt-1">LVL Rank</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <h4 className="font-extrabold text-base text-white">{user.rankName}</h4>
                <p className="text-[10px] text-text-muted">{user.xp} / 1000 XP to next level</p>
              </div>
            </div>

            {/* Subject Distribution pie chart */}
            <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Subject weight ratio</h3>
              
              <div className="w-full h-40 flex items-center justify-center relative bg-black/10 rounded-2xl">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {subjectDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Circular chart legend absolute */}
                <div className="absolute flex flex-col items-center justify-center text-[10px] text-text-muted">
                  <span className="font-bold text-white text-sm">{subjects.length}</span>
                  <span>Subjects</span>
                </div>
              </div>
            </div>

            {/* AI Diagnostics: Weak topics detector */}
            <div className="glass-panel border border-color rounded-3xl p-5 space-y-4 bg-yellow-500/3 border-yellow-500/10">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-xs font-extrabold text-yellow-500 tracking-tight flex items-center gap-1.5">
                  <ShieldAlert size={14} className="animate-pulse" />
                  Cognitive Diagnostic
                </h3>
                <span className="text-[8px] font-bold text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded uppercase">AI WARNING</span>
              </div>

              {diagnostics.map((diag, index) => (
                <div key={index} className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-white flex items-center justify-between">
                      <span>{diag.subjectName}</span>
                      <span className="text-yellow-500 font-extrabold">{diag.score}% Accuracy</span>
                    </h4>
                    <p className="text-[10px] text-text-muted leading-relaxed">
                      {diag.reason}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                    <h5 className="text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                      <Sparkles size={11} className="text-yellow-400 animate-bounce" />
                      Tutor Spaced Instruction
                    </h5>
                    <p className="text-[10px] text-text-muted leading-relaxed italic">
                      "{diag.recommendation}"
                    </p>
                    <button
                      onClick={() => router.push(`/workspace?subject=${diag.subjectId}`)}
                      className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 mt-1"
                    >
                      Retrieve Note Context
                      <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </main>

      {/* Floating Pomodoro clock */}
      <PomodoroTimer />
    </div>
  );
}

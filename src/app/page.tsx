'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  BrainCircuit, 
  Flame, 
  Zap, 
  Clock, 
  BookOpen, 
  Mic, 
  ArrowRight,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080c14] relative overflow-hidden flex flex-col justify-between selection:bg-indigo-500/30 selection:text-white">
      
      {/* Decorative Glow Background Spots */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Aura <span className="text-cyan-400 font-medium">Study</span>
          </span>
        </div>
        
        <Link 
          href="/auth"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-sm font-semibold border border-white/10 hover:border-white/20 text-white transition-all duration-200 cursor-pointer"
        >
          Demo Access
          <ArrowRight size={14} />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-12 lg:py-24">
        
        {/* Text Area */}
        <div className="space-y-8 text-center lg:text-left">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wide uppercase select-none animate-pulse">
            <BrainCircuit size={12} />
            Next-Gen Spaced Learning System
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Your AI Study Partner, <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-500 bg-clip-text text-transparent animate-gradient">
              Gamified & Refined.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Unify the deep conversational intelligence of **ChatGPT**, the hyper-structured markdown workflows of **Notion AI**, and the highly motivating streak systems of **Duolingo** in a single breathtaking dashboard.
          </p>

          {/* Action Controllers */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link 
              href="/auth"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-102 active:scale-98 transition-all font-bold text-white text-base shadow-xl shadow-indigo-500/20 glow-border cursor-pointer"
            >
              Enter Study Sanctuary
              <ArrowRight size={18} />
            </Link>
            
            <a 
              href="#features" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-colors cursor-pointer"
            >
              Explore Features
            </a>
          </div>

          {/* Integration Mini Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5 max-w-md mx-auto lg:mx-0">
            <div>
              <h4 className="text-2xl font-extrabold text-indigo-400">150+</h4>
              <p className="text-xs text-text-muted mt-0.5">XP Points per hour</p>
            </div>
            <div>
              <h4 className="text-2xl font-extrabold text-cyan-400">O(1)</h4>
              <p className="text-xs text-text-muted mt-0.5">Spaced repetition reviews</p>
            </div>
            <div>
              <h4 className="text-2xl font-extrabold text-pink-400">100%</h4>
              <p className="text-xs text-text-muted mt-0.5">Interactive fallback</p>
            </div>
          </div>
        </div>

        {/* Dashboard Visual Mockup illustration */}
        <div className="relative w-full aspect-video lg:aspect-square flex items-center justify-center">
          
          {/* Glass Card Mockup wrapper */}
          <div className="w-full max-w-lg glass-panel rounded-3xl p-5 border border-white/10 shadow-2xl relative z-10 space-y-4 hover:scale-102 transition-transform duration-300">
            {/* Window control circles */}
            <div className="flex items-center gap-1.5 pb-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <span className="text-[10px] text-text-muted ml-3 font-semibold tracking-wider uppercase">AURA CORE DASHBOARD</span>
            </div>

            {/* Widget layout grids */}
            <div className="grid grid-cols-2 gap-3">
              {/* Daily Streak Card */}
              <div className="p-3.5 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex items-center gap-3">
                <Flame size={28} className="text-orange-500 animate-flame fill-orange-500/10" />
                <div>
                  <h5 className="text-[11px] font-bold text-orange-400/80 uppercase">Study Streak</h5>
                  <p className="text-xl font-black text-white">8 Days Active</p>
                </div>
              </div>

              {/* level Progress Widget */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-3">
                <Zap size={24} className="text-indigo-400 animate-pulse" />
                <div>
                  <h5 className="text-[11px] font-bold text-indigo-400/80 uppercase">Cognitive Rank</h5>
                  <p className="text-sm font-black text-white">Level 12 Master</p>
                </div>
              </div>
            </div>

            {/* Simulated AI Chat Pane Mockup */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">AI</div>
                <span className="text-xs font-bold text-indigo-300">Socratic Mind</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed italic border-l-2 border-indigo-500/40 pl-3.5">
                "We represent attention math using matrices. Query matching values. Let's see, what is the core bottleneck of this linear math?"
              </p>
              <div className="flex items-center gap-2 pt-1.5 border-t border-white/5">
                <span className="text-[9px] font-semibold bg-white/5 border border-color rounded-full px-2 py-0.5 text-text-primary">Explain like I'm 5</span>
                <span className="text-[9px] font-semibold bg-white/5 border border-color rounded-full px-2 py-0.5 text-text-primary">Generate Quiz</span>
              </div>
            </div>

            {/* Pomodoro Focus Simulation panel */}
            <div className="p-3.5 rounded-2xl bg-[#080c14]/50 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-xs font-bold font-mono text-white">18:42</span>
                <span className="text-[10px] text-text-muted tracking-wider uppercase font-semibold">Focus Mode Shield</span>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                AMBIENT Lofi Sound active
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Section Grid */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-20 relative z-20 border-t border-white/5">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-white">Engineered for Hyper-Focus & Spaced Mastery</h2>
          <p className="text-sm text-text-muted max-w-md mx-auto">Discover a robust ecosystem of micro-features engineered to enhance mental mapping.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Socratic AI Tutor",
              desc: "Three tailored system personas (Socratic, ELI5, Staff Dev) that clarify hard topics via interactive conversations.",
              icon: BrainCircuit,
              color: "text-indigo-400 bg-indigo-500/10"
            },
            {
              title: "OCR Notes Upload",
              desc: "Simulate drag-and-drop document parsers that automatically build flashcards and key revision sheets in one click.",
              icon: BookOpen,
              color: "text-cyan-400 bg-cyan-500/10"
            },
            {
              title: "Spaced Leitner Decks",
              desc: "3D interactive flip cards sorted mathematically into five repetition boxes, spacing review schedules for long-term memory.",
              icon: Zap,
              color: "text-pink-400 bg-pink-500/10"
            },
            {
              title: "Audio Voice Dictations",
              desc: "Real-time speech recording panels displaying interactive canvas waveforms, building clean study logs automatically.",
              icon: Mic,
              color: "text-orange-400 bg-orange-500/10"
            }
          ].map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div 
                key={index} 
                className="glass-card rounded-2xl p-6 border border-white/5 space-y-4 text-left group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${feat.color}`}>
                  <Icon size={20} className="group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-bold text-lg text-white">{feat.title}</h4>
                <p className="text-xs text-text-muted leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer bar */}
      <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-text-muted z-20 relative">
        <p>© 2026 Aura Study (Advanced AI Study Assistant). Built for developers, designers, and self-learners.</p>
      </footer>
    </div>
  );
}

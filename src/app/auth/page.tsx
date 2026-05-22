'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudy } from '../../context/StudyContext';
import { Sparkles, ArrowRight, User, ShieldAlert, Sparkle } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { user } = useStudy();
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('⚡');
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const avatarsList = ['⚡', '🦁', '🦊', '🐼', '🦄', '👽', '👾', '🚀'];

  const handleDemoAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDemoLoading(true);
    
    // Simulate loading for realistic premium feeling
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#080c14] relative overflow-hidden flex items-center justify-center p-6">
      
      {/* Dynamic atmospheric ambient backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '3.5s' }} />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md glass-panel border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 hover:border-indigo-500/20 transition-all duration-300">
        
        {/* Logo Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Sparkle size={24} className="animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Enter study Sanctuary</h2>
            <p className="text-xs text-text-muted">Unlock AI Spaced Repetition & Gamified Learning</p>
          </div>
        </div>

        {/* Demo login quick-portal */}
        <form onSubmit={handleDemoAccess} className="space-y-5">
          
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
            <h3 className="text-xs font-extrabold text-indigo-300 tracking-wider uppercase flex items-center gap-1.5">
              <User size={12} />
              Pre-Configured Portfolio User
            </h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Logging in as developer demo **Dharmesh**. Includes a pre-populated history of mock notes, spacing matrices, daily streaks, and custom Pomodoro logs.
            </p>
          </div>

          {/* User profile customizations */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase">Customize Avatar:</label>
            <div className="grid grid-cols-8 gap-2">
              {avatarsList.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg transition-all cursor-pointer hover:scale-105 active:scale-95
                    ${avatar === av 
                      ? 'bg-indigo-600/20 border-indigo-400 text-white scale-110 shadow-lg' 
                      : 'bg-white/5 border-color text-text-muted hover:border-white/10'}`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Direct login trigger */}
          <button
            type="submit"
            disabled={isDemoLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-[1.01] active:scale-[0.99] font-extrabold text-white text-sm shadow-xl shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
          >
            {isDemoLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Materializing Study Matrix...
              </span>
            ) : (
              <>
                Initialize Demo Workspace
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Informative alert box */}
        <div className="flex gap-2.5 p-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-yellow-500/80">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed">
            **Security note:** Aura Study uses local browser encryption storage. Your configurations, notes, and progress logs are saved client-side, requiring no databases.
          </p>
        </div>
      </div>
    </div>
  );
}

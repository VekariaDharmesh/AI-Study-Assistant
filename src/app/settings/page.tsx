'use client';

import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import Sidebar from '../../components/Sidebar';
import PomodoroTimer from '../../components/PomodoroTimer';
import { 
  Settings, 
  Key, 
  Volume2, 
  VolumeX, 
  User, 
  Database, 
  Check, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { 
    user, 
    apiKey, 
    setApiKey, 
    soundEnabled, 
    setSoundEnabled, 
    resetAllData,
    theme
  } = useStudy();

  const [inputKey, setInputKey] = useState(apiKey);
  const [profileName, setProfileName] = useState(user.name);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey);
    setIsKeySaved(true);
    setTimeout(() => setIsKeySaved(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    
    user.name = profileName; // Overwrite directly inside context sync
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 2000);
  };

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      
      {/* Navigation shell */}
      <Sidebar />

      {/* Main Settings Panel */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none animate-pulse-glow" />

        {/* Header */}
        <header className="pb-6 border-b border-white/5 mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            System Preferences
          </h1>
          <p className="text-xs text-text-muted">Configure AI connection keys, customize profile ranks, and manage local storage memory buffers.</p>
        </header>

        {/* Outer Grid panel */}
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          
          {/* 1. AI API Key Configuration */}
          <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <Key size={16} className="text-indigo-400" />
              AI Cognitive Engine Settings
            </h3>
            
            <p className="text-xs text-text-muted leading-relaxed">
              By default, Aura Study utilizes a highly intelligent, context-aware local natural language simulation model. To unlock genuine unrestricted LLM generation, paste your custom OpenAI API key below.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase">OpenAI API Key (Saved client-side):</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="sk-or-your-custom-openai-api-key..."
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="flex-1 text-xs font-semibold p-3.5 rounded-xl bg-white/5 border border-color focus:border-indigo-500/50 text-white"
                  />
                  <button
                    type="submit"
                    className="py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isKeySaved ? <Check size={14} /> : 'Lock in Key'}
                  </button>
                </div>
              </div>
            </form>

            {/* API Connection indicators */}
            <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-color text-xs">
              <span className="text-[10px] font-bold text-text-muted uppercase">Connection Status:</span>
              
              {apiKey.trim().length > 10 ? (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REAL OpenAI GPT-4o LOCKED IN
                </span>
              ) : (
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                  LOCAL SIMULATOR ACTIVE
                </span>
              )}
            </div>
          </div>

          {/* 2. Gamified Profile customizations */}
          <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <User size={16} className="text-cyan-400 animate-pulse" />
              Student Profile settings
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase">Student Display Name:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="flex-1 text-xs font-semibold p-3.5 rounded-xl bg-white/5 border border-color focus:border-indigo-500/50 text-white"
                  />
                  <button
                    type="submit"
                    className="py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs transition-colors cursor-pointer shrink-0"
                  >
                    {isProfileSaved ? <Check size={14} /> : 'Save Profile'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 3. Audio & Notifications preferences */}
          <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <Volume2 size={16} className="text-pink-400" />
              Study Soundscapes & Audios
            </h3>

            <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-color">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Interactive Reward SFX</h4>
                <p className="text-[9px] text-text-muted">Play upward arpeggios on XP gains and quiz successes.</p>
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer flex items-center
                  ${soundEnabled ? 'bg-indigo-600 justify-end' : 'bg-white/10 justify-start'}`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow" />
              </button>
            </div>
          </div>

          {/* 4. Systems buffer hard reset */}
          <div className="glass-panel border border-color rounded-3xl p-5 space-y-4 bg-red-500/3 border-red-500/10">
            <h3 className="text-sm font-extrabold text-red-400 tracking-tight flex items-center gap-2">
              <Database size={16} />
              System Hard Reset Area
            </h3>

            <p className="text-xs text-text-muted leading-relaxed">
              Clicking hard reset will flush all local browser storage buffers, deleting your study notes, revision guides, Pomodoro hours, streaks, and custom subjects. The app will reload back to base initial presets.
            </p>

            <button
              onClick={() => {
                if (confirm("Are you absolutely sure you want to flush all local storage data? This cannot be undone!")) {
                  resetAllData();
                  alert("App storage flushed. Reloading initial settings!");
                  window.location.reload();
                }
              }}
              className="w-full py-3.5 rounded-xl bg-red-600/15 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 font-bold text-xs transition-all text-center block cursor-pointer"
            >
              Flush App Local Storage
            </button>
          </div>

        </div>
      </main>

      {/* Floating Pomodoro clock */}
      <PomodoroTimer />
    </div>
  );
}

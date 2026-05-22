'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStudy } from '../context/StudyContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  UploadCloud, 
  Award, 
  BarChart3, 
  Calendar, 
  Settings, 
  Flame, 
  Zap, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const { user, theme } = useStudy();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Tutor Chat', path: '/workspace', icon: MessageSquare },
    { name: 'Upload & OCR', path: '/upload', icon: UploadCloud },
    { name: 'Quiz & Flashcards', path: '/quiz', icon: Award },
    { name: 'Study Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Planner & Spacing', path: '/planner', icon: Calendar },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  // Circle SVG metrics for level progression
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (user.xp / 1000) * circumference;

  return (
    <aside 
      className={`glass-panel border-r shrink-0 flex flex-col justify-between transition-all duration-300 relative z-30
        ${isCollapsed ? 'w-20' : 'w-64'} h-screen p-4`}
    >
      {/* Collapse Trigger Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-secondary border border-color rounded-full p-1 cursor-pointer text-text-muted hover:text-text-primary z-40 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div>
        {/* App Logo branding */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Aura <span className="text-cyan-400 font-medium">Study</span>
            </span>
          )}
        </div>

        {/* User Mini Profile Panel */}
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 mb-6 transition-all duration-200
          ${isCollapsed ? 'justify-center px-1' : ''}`}
        >
          {/* Circular Level Ring */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle 
                cx="28" cy="28" r={radius} 
                className="stroke-white/10 fill-none" 
                strokeWidth="3.5" 
              />
              <circle 
                cx="28" cy="28" r={radius} 
                className="stroke-indigo-500 fill-none transition-all duration-500" 
                strokeWidth="3.5" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ stroke: 'var(--primary)' }}
              />
            </svg>
            <span className="absolute text-xs font-bold font-mono">{user.level}</span>
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <h4 className="font-semibold text-sm truncate text-text-primary flex items-center gap-1.5">
                {user.name} 
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold tracking-wider uppercase">DEMO</span>
              </h4>
              <p className="text-[11px] text-text-muted truncate">{user.rankName}</p>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-text-muted">
                <Zap size={10} className="text-yellow-400" />
                <span>{user.xp} / 1000 XP</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-500/25 to-cyan-500/5 text-white border border-indigo-500/20' 
                    : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'}`}
                style={isActive ? { borderLeftColor: 'var(--primary)' } : {}}
              >
                <Icon 
                  size={18} 
                  className={`transition-colors duration-200 group-hover:scale-105
                    ${isActive ? 'text-indigo-400' : 'text-text-muted'}`}
                  style={isActive ? { color: 'var(--primary)' } : {}}
                />
                
                {!isCollapsed ? (
                  <span className="text-sm font-medium">{item.name}</span>
                ) : (
                  <div className="absolute left-16 bg-secondary border border-color text-text-primary px-2.5 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Daily Streak Indicator */}
      <div className={`p-3 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-between gap-3
        ${isCollapsed ? 'flex-col justify-center px-1' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
            <Flame size={18} className="text-orange-500 animate-flame fill-orange-500/20" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h5 className="font-semibold text-sm text-orange-200">Daily Streak</h5>
              <p className="text-[10px] text-orange-400/80">Study daily to multiply XP!</p>
            </div>
          )}
        </div>
        {!isCollapsed ? (
          <span className="font-bold text-lg text-orange-400 pr-1">{user.streak}d</span>
        ) : (
          <span className="font-bold text-xs text-orange-400">{user.streak}d</span>
        )}
      </div>
    </aside>
  );
}

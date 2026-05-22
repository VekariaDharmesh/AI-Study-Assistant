'use client';

import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import Sidebar from '../../components/Sidebar';
import PomodoroTimer from '../../components/PomodoroTimer';
import * as Icons from 'lucide-react';

export default function PlannerPage() {
  const { 
    tasks, 
    subjects, 
    addTask, 
    completeTask, 
    deleteTask, 
    theme 
  } = useStudy();

  // Task creation states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-05-23');
  const [taskPomoCount, setTaskPomoCount] = useState(2);

  // Pre-load default subject
  React.useEffect(() => {
    if (subjects.length > 0 && !taskSubjectId) {
      setTaskSubjectId(subjects[0].id);
    }
  }, [subjects]);

  // 1. Calendar generation logic for May 2026 (Local time 2026-05-22)
  const currentYear = 2026;
  const currentMonth = 4; // May (0-indexed, Jan is 0)
  const monthName = 'May 2026';

  // May 2026 starts on a Friday (5)
  const startDayOfWeek = 5; 
  const daysInMonth = 31;

  const calendarDays = [];
  
  // Fill empty leading padding slots
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push({ dayNum: null, dateStr: '' });
  }

  // Fill actual dates
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = d.toString().padStart(2, '0');
    const dateStr = `${currentYear}-05-${dayStr}`;
    calendarDays.push({ dayNum: d, dateStr });
  }

  // Task submission handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskSubjectId) return;

    addTask(taskTitle, taskSubjectId, taskDueDate, taskPomoCount);
    setTaskTitle('');
  };

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      
      {/* Navigation Shell */}
      <Sidebar />

      {/* Main planner panel */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none animate-pulse-glow" />

        {/* Header */}
        <header className="pb-6 border-b border-white/5 mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Spaced Study Planner & Calendar
          </h1>
          <p className="text-xs text-text-muted">Plan your weekly revision sessions, track due assignments, and schedule spaced repetition review slots.</p>
        </header>

        {/* 2-Pane split screen */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
          
          {/* LEFT COLUMN: Notion Task Manager (Span 1) */}
          <div className="space-y-6">
            
            {/* Create new task console */}
            <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                <Icons.PlusSquare size={16} className="text-indigo-400" />
                Schedule study Task
              </h3>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Task Description:</label>
                  <input
                    type="text"
                    placeholder="E.g. Read neural weights chapter..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-xl bg-white/5 border border-color focus:border-indigo-500/50 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase">Subject:</label>
                    <select
                      value={taskSubjectId}
                      onChange={(e) => setTaskSubjectId(e.target.value)}
                      className="w-full text-xs font-semibold p-3 rounded-xl bg-white/5 border border-color text-text-primary"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name.substring(0, 12)}...</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase">Estimated Pomos:</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={taskPomoCount}
                      onChange={(e) => setTaskPomoCount(parseInt(e.target.value) || 2)}
                      className="w-full text-xs font-semibold p-3 rounded-xl bg-white/5 border border-color text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Due Date:</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-xl bg-white/5 border border-color text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/15"
                >
                  <Icons.CheckCircle size={14} />
                  Add Study Task
                </button>
              </form>
            </div>

            {/* Notion checklist list */}
            <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                <Icons.ListTodo size={16} className="text-cyan-400" />
                Task Board list
              </h3>

              <div className="space-y-3">
                {tasks.map(task => {
                  const subColor = subjects.find(s => s.id === task.subjectId)?.color || '#6366f1';
                  return (
                    <div 
                      key={task.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative overflow-hidden group
                        ${task.completed 
                          ? 'bg-white/2 border-color opacity-50' 
                          : 'bg-white/5 border-color hover:border-white/10'}`}
                    >
                      {/* Left color strip */}
                      <div className="absolute top-0 bottom-0 left-0 w-1" style={{ backgroundColor: subColor }} />

                      <button
                        onClick={() => completeTask(task.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer mt-0.5 transition-colors
                          ${task.completed 
                            ? 'bg-indigo-600 border-indigo-500 text-white' 
                            : 'border-color hover:border-indigo-500 text-transparent hover:text-indigo-500'}`}
                      >
                        <Icons.Check size={14} strokeWidth={3.5} />
                      </button>

                      <div className="min-w-0 flex-1 space-y-1">
                        <h5 className={`text-xs font-bold leading-normal truncate text-white
                          ${task.completed ? 'line-through text-text-muted' : ''}`}
                        >
                          {task.title}
                        </h5>
                        <div className="flex items-center gap-2.5 text-[9px] text-text-muted">
                          <span className="flex items-center gap-0.5">
                            <Icons.Calendar size={9} />
                            {task.dueDate}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Icons.Timer size={9} />
                            {task.completedPomodoros}/{task.estimatedPomodoros} Pomo
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 cursor-pointer ml-1"
                      >
                        <Icons.Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Spaced calendar month view (Span 2) */}
          <div className="xl:col-span-2 space-y-6">
            
            <div className="glass-panel border border-color rounded-3xl p-5 space-y-5">
              
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Icons.CalendarDays size={16} className="text-pink-400" />
                  {monthName}
                </h3>
                <span className="text-[10px] font-bold text-text-muted uppercase">Interval spacing calendar</span>
              </div>

              {/* Day names list header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <span key={day} className="py-2">{day}</span>
                ))}
              </div>

              {/* Days grid layout */}
              <div className="grid grid-cols-7 gap-1 bg-white/2 p-1 rounded-2xl border border-color">
                {calendarDays.map((day, index) => {
                  const dayTasks = tasks.filter(t => t.dueDate === day.dateStr);
                  const isToday = day.dateStr === '2026-05-22';
                  
                  return (
                    <div
                      key={index}
                      className={`aspect-square p-2.5 rounded-xl border flex flex-col justify-between relative group transition-colors
                        ${day.dayNum === null 
                          ? 'border-transparent bg-transparent' 
                          : isToday 
                            ? 'bg-indigo-600/10 border-indigo-500/35 shadow-sm' 
                            : 'bg-primary/45 border-color hover:bg-white/5'}`}
                    >
                      {day.dayNum !== null && (
                        <>
                          <span className={`text-xs font-black select-none
                            ${isToday ? 'text-indigo-400' : 'text-text-primary'}`}
                          >
                            {day.dayNum}
                          </span>

                          {/* Event Indicators */}
                          <div className="flex gap-1 overflow-hidden h-2 pb-0.5">
                            {dayTasks.map(task => {
                              const subColor = subjects.find(s => s.id === task.subjectId)?.color || '#6366f1';
                              return (
                                <span 
                                  key={task.id} 
                                  className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" 
                                  style={{ backgroundColor: subColor }}
                                  title={task.title}
                                />
                              );
                            })}
                          </div>

                          {/* Calendar Hover options overlay */}
                          {day.dateStr && (
                            <button
                              onClick={() => {
                                setTaskDueDate(day.dateStr);
                                setTaskTitle(`Spaced Revision Session`);
                              }}
                              className="absolute inset-0 flex items-center justify-center bg-indigo-600/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white cursor-pointer"
                            >
                              + Book
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Color legends keys */}
              <div className="flex flex-wrap gap-4 pt-2 justify-center border-t border-white/5">
                <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Today Date
                </span>
                
                {subjects.map(s => (
                  <span key={s.id} className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name.substring(0, 10)}...
                  </span>
                ))}
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Floating Pomodoro clock */}
      <PomodoroTimer />
    </div>
  );
}

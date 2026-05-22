'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Zap, 
  Moon,
  Coffee,
  X,
  Compass
} from 'lucide-react';

export default function PomodoroTimer() {
  const { logPomodoroSession, tasks, incrementPomodoroProgress, soundEnabled, setFocusMode, focusMode } = useStudy();
  
  // Timer States
  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeAmbient, setActiveAmbient] = useState<'none' | 'rain' | 'waves' | 'binaural'>('none');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Web Audio Context Synthesizer references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseSourceNode = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const filterNode = useRef<BiquadFilterNode | null>(null);
  const waveGainNode = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);

  // Time durations in seconds
  const DURATIONS = {
    focus: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60
  };

  // 1. Timer Tick Effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  // Sync mode changes with time
  const handleModeChange = (newMode: 'focus' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
  };

  // Timer complete logic
  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Log to study state
    const mins = Math.floor(DURATIONS[mode] / 60);
    logPomodoroSession(undefined, mins, mode);

    // If focus mode and a task is active, increment its pomodoro counter
    if (mode === 'focus' && selectedTaskId) {
      incrementPomodoroProgress(selectedTaskId);
    }

    // Alarm synthesis chime (Web Audio)
    playAlarmSound();
    
    // Reset timer
    setTimeLeft(DURATIONS[mode]);
    setFocusMode(false);
  };

  const playAlarmSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      // Sweet 3-bell sequence
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.2, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.5);
        
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.6);
      });
    } catch (e) {
      console.warn("Chime blocked by browser");
    }
  };

  // 2. Synthesize Procedural Ambient White/Brown Noise in real-time
  const toggleAmbientSound = (soundType: 'none' | 'rain' | 'waves' | 'binaural') => {
    // Clean existing audio layers first
    stopAmbientSynth();

    if (soundType === 'none') {
      setActiveAmbient('none');
      return;
    }

    try {
      // Initialize Audio Context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      
      if (soundType === 'rain') {
        // Synthesizing Brown Noise (Rain sound: heavily low-passed random noise)
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Brownian integration filter
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          // Scale rain volume
          output[i] *= 3.5;
        }

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, ctx.currentTime);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start();
        noiseSourceNode.current = source as any;
        filterNode.current = filter;
        waveGainNode.current = gain;
      } 
      else if (soundType === 'waves') {
        // Ocean Waves: White noise modulated by low frequency oscillator (LFO)
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        // LFO setup for wave crashes (0.12 Hz - 8 second waves cycle)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
        
        lfoGain.gain.setValueAtTime(0.06, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain); // Modulate wave volume
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start();
        lfo.start();
        
        noiseSourceNode.current = source as any;
        waveGainNode.current = gain;
      } 
      else if (soundType === 'binaural') {
        // Binaural Beat Focus: 110Hz left channel, 111.5Hz right channel for alpha brain waves
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const gain = ctx.createGain();

        oscLeft.type = 'sine';
        oscLeft.frequency.setValueAtTime(110, ctx.currentTime); // Low baritone frequency

        oscRight.type = 'sine';
        oscRight.frequency.setValueAtTime(111.5, ctx.currentTime); // 1.5Hz alpha wave drift

        gain.gain.setValueAtTime(0.04, ctx.currentTime); // Keep binaural hum very subtle

        if (pannerLeft && pannerRight) {
          pannerLeft.pan.setValueAtTime(-1, ctx.currentTime); // Left ear
          pannerRight.pan.setValueAtTime(1, ctx.currentTime); // Right ear
          
          oscLeft.connect(pannerLeft);
          pannerLeft.connect(gain);
          
          oscRight.connect(pannerRight);
          pannerRight.connect(gain);
        } else {
          oscLeft.connect(gain);
          oscRight.connect(gain);
        }

        gain.connect(ctx.destination);

        oscLeft.start();
        oscRight.start();

        osc1Ref.current = oscLeft;
        osc2Ref.current = oscRight;
        waveGainNode.current = gain;
      }

      setActiveAmbient(soundType);
    } catch (e) {
      console.error("Audio Synthesis unsupported or blocked", e);
    }
  };

  const stopAmbientSynth = () => {
    try {
      if (noiseSourceNode.current) {
        (noiseSourceNode.current as any).stop();
        noiseSourceNode.current = null;
      }
      if (osc1Ref.current) {
        osc1Ref.current.stop();
        osc1Ref.current = null;
      }
      if (osc2Ref.current) {
        osc2Ref.current.stop();
        osc2Ref.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {
      // Synth already closed
    }
    setActiveAmbient('none');
  };

  // Cleanup synthesizer on component unmount
  useEffect(() => {
    return () => {
      stopAmbientSynth();
    };
  }, []);

  // Time conversion
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentDuration = DURATIONS[mode];
  const progressPercent = ((currentDuration - timeLeft) / currentDuration) * 100;
  
  // Circle details
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Render Float Minimizer vs Full Focus Widget
  return (
    <>
      {/* 1. Global Floating Controller (when minimized) */}
      {isMinimized && !focusMode && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300">
          <button 
            onClick={() => setIsMinimized(false)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 hover:scale-110 active:scale-95 shadow-2xl flex items-center justify-center text-white cursor-pointer relative group glow-border"
          >
            <Compass size={24} className={isRunning ? "animate-spin" : "animate-bounce"} style={{ animationDuration: '6s' }} />
            {isRunning && (
              <span className="absolute -top-1.5 -right-1 bg-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-primary animate-pulse">
                {formatTime(timeLeft)}
              </span>
            )}
            <div className="absolute right-16 bg-secondary border border-color text-text-primary px-2.5 py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap">
              Open Focus Pomodoro
            </div>
          </button>
        </div>
      )}

      {/* 2. Expanded Pomodoro Card Panel */}
      {!isMinimized && !focusMode && (
        <div className="fixed bottom-6 right-6 z-50 w-80 glass-panel border border-color rounded-3xl p-5 shadow-2xl flex flex-col gap-4 transition-all duration-300">
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              <Zap size={14} className="text-yellow-400" />
              Focus Space
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setFocusMode(true);
                  setIsMinimized(false);
                }}
                className="text-text-muted hover:text-white cursor-pointer transition-colors"
                title="Full-screen Focus Mode"
              >
                <Maximize2 size={15} />
              </button>
              <button 
                onClick={() => setIsMinimized(true)}
                className="text-text-muted hover:text-white cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mode Selectors */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/5">
            {(['focus', 'short_break', 'long_break'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleModeChange(t)}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer capitalize
                  ${mode === t 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-text-muted hover:text-white hover:bg-white/5'}`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Timer Display Widget */}
          <div className="flex flex-col items-center justify-center relative py-2">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle 
                cx="80" cy="80" r={radius} 
                className="stroke-white/5 fill-none" 
                strokeWidth="4" 
              />
              <circle 
                cx="80" cy="80" r={radius} 
                className="stroke-indigo-500 fill-none transition-all duration-300" 
                strokeWidth="4" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ stroke: 'var(--primary)' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-white">{formatTime(timeLeft)}</span>
              <span className="text-[10px] text-text-muted tracking-wider uppercase font-semibold mt-0.5">
                {mode === 'focus' ? 'Focus Session' : 'Relax & Breathe'}
              </span>
            </div>
          </div>

          {/* Actions Controllers */}
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={() => handleModeChange(mode)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>
            
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 hover:scale-105 flex items-center justify-center text-white cursor-pointer shadow-lg shadow-indigo-500/10"
            >
              {isRunning ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-1" />}
            </button>

            <div className="relative group">
              <button
                className={`p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer
                  ${activeAmbient !== 'none' ? 'text-indigo-400 bg-indigo-500/10' : 'text-text-muted'}`}
                title="Binaural/Rain Sounds"
              >
                {activeAmbient !== 'none' ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              
              {/* Audio Overlay Menu */}
              <div className="absolute right-0 bottom-full mb-2 bg-secondary border border-color rounded-xl p-2 shadow-2xl space-y-1 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 min-w-32">
                <p className="text-[10px] font-bold text-text-muted px-2 py-0.5 border-b border-white/5 mb-1 text-center">SOUNDSCAPES</p>
                {(['none', 'rain', 'waves', 'binaural'] as const).map((sound) => (
                  <button
                    key={sound}
                    onClick={() => toggleAmbientSound(sound)}
                    className={`w-full text-left px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors capitalize
                      ${activeAmbient === sound ? 'bg-indigo-500/20 text-indigo-300' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                  >
                    {sound}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Associate Active Study Task Selector */}
          {mode === 'focus' && tasks.filter(t => !t.completed).length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase">Linked Task:</label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white/5 border border-color focus:border-indigo-500/55 text-text-primary"
              >
                <option value="">-- No Linked Task --</option>
                {tasks.filter(t => !t.completed).map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* 3. Full-Screen Distraction Blocker Focus Mode Overlay */}
      {focusMode && (
        <div className="fixed inset-0 focus-overlay z-50 flex flex-col items-center justify-center p-6 transition-all duration-500">
          
          {/* Calming Background ambient glow lights */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />

          {/* Top Focus Mode Toolbar */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-text-muted">
            <span className="text-sm font-semibold tracking-widest text-indigo-400 uppercase flex items-center gap-2">
              <Zap size={14} className="text-yellow-400 animate-pulse" />
              Focus Shield Active
            </span>
            <button 
              onClick={() => setFocusMode(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white border border-color transition-colors text-xs font-semibold cursor-pointer"
            >
              <Minimize2 size={14} />
              Exit Focus Shield
            </button>
          </div>

          {/* Central Timer Console */}
          <div className="flex flex-col items-center gap-8 max-w-md text-center relative z-10">
            
            {/* Visual countdown shield */}
            <div className="flex flex-col items-center justify-center relative">
              <svg className="w-64 h-64 transform -rotate-90 scale-110">
                <circle 
                  cx="128" cy="128" r="100" 
                  className="stroke-white/5 fill-none" 
                  strokeWidth="3.5" 
                />
                <circle 
                  cx="128" cy="128" r="100" 
                  className="stroke-indigo-500 fill-none transition-all duration-300" 
                  strokeWidth="3.5" 
                  strokeDasharray={2 * Math.PI * 100}
                  strokeDashoffset={2 * Math.PI * 100 - (progressPercent / 100) * (2 * Math.PI * 100)}
                  strokeLinecap="round"
                  style={{ stroke: 'var(--primary)' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-6xl font-black font-mono tracking-tighter text-white select-none">{formatTime(timeLeft)}</span>
                <span className="text-xs font-bold text-text-muted tracking-widest uppercase mt-2">
                  {mode === 'focus' ? 'LOCK IN FOCUS' : 'Breathe & Re-align'}
                </span>
              </div>
            </div>

            {/* Motivational Focus Affirmation Quote */}
            <div className="h-16 flex items-center justify-center">
              {mode === 'focus' ? (
                <p className="text-lg font-medium text-indigo-200/90 max-w-sm italic">
                  "Focus is a muscle. The distractions you ignore now build the intelligence of your future self."
                </p>
              ) : (
                <p className="text-lg font-medium text-cyan-200/90 max-w-sm italic">
                  "Rest is part of the work. Let your thoughts settle like silt in a quiet pool."
                </p>
              )}
            </div>

            {/* Controls Console */}
            <div className="flex items-center gap-6">
              {/* Sounds Selector Widget */}
              <div className="flex gap-2">
                {(['none', 'rain', 'waves', 'binaural'] as const).map((soundName) => (
                  <button
                    key={soundName}
                    onClick={() => toggleAmbientSound(soundName)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase border cursor-pointer transition-all duration-200
                      ${activeAmbient === soundName 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow shadow-indigo-600/40' 
                        : 'bg-white/5 border-color text-text-muted hover:text-white hover:bg-white/10'}`}
                  >
                    {soundName}
                  </button>
                ))}
              </div>

              {/* Central Play toggle */}
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center text-white cursor-pointer"
              >
                {isRunning ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1.5" />}
              </button>

              <button
                onClick={() => handleModeChange(mode)}
                className="p-3.5 rounded-full bg-white/5 hover:bg-white/10 hover:text-white border border-color text-text-muted transition-colors cursor-pointer"
                title="Reset Session"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

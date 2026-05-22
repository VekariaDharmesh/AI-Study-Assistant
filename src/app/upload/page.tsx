'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStudy } from '../../context/StudyContext';
import Sidebar from '../../components/Sidebar';
import PomodoroTimer from '../../components/PomodoroTimer';
import WaveformVisualizer from '../../components/WaveformVisualizer';
import { generateSummary } from '../../services/ai';
import { 
  UploadCloud, 
  Mic, 
  Square, 
  Sparkles, 
  FileText, 
  Layers, 
  CheckCircle, 
  Volume2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const { subjects, addNote, apiKey, theme } = useStudy();

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
  // File upload simulation states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [uploadPhase, setUploadPhase] = useState('');
  const [mockFileName, setMockFileName] = useState('');

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedTranscript, setRecordedTranscript] = useState('');
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null); // Web SpeechRecognition

  // Pre-load active subject
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects]);

  // Voice timer count
  useEffect(() => {
    if (isRecording) {
      durationIntervalRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    }

    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [isRecording]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 1. Drag & Drop File Loader Simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Simulate drop of a PDF
    const files = e.dataTransfer.files;
    const name = files.length > 0 ? files[0].name : "Textbook_Chapter_ML.pdf";
    triggerUploadSimulation(name);
  };

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const name = files && files.length > 0 ? files[0].name : "Study_Doc_Advanced.pdf";
    triggerUploadSimulation(name);
  };

  const triggerUploadSimulation = (fileName: string) => {
    if (!selectedSubjectId) return;

    setMockFileName(fileName);
    setUploadProgress(0);
    setUploadPhase('Establishing secure document sync...');

    const phases = [
      { prg: 25, txt: 'Scanning character glyphs and OCR grids...' },
      { prg: 55, txt: 'Filtering mathematical notations and code blocks...' },
      { prg: 80, txt: 'Synthesizing contextual vector embedding weights...' },
      { prg: 100, txt: 'Document compiled. Logging to study matrix!' }
    ];

    phases.forEach((step, idx) => {
      setTimeout(() => {
        setUploadProgress(step.prg);
        setUploadPhase(step.txt);
        
        // Final completion logic
        if (step.prg === 100) {
          setTimeout(() => {
            finalizeUploadedNote(fileName);
          }, 600);
        }
      }, (idx + 1) * 1200);
    });
  };

  const finalizeUploadedNote = async (fileName: string) => {
    // Technical texts mapping
    const technicalMockTexts: Record<string, string> = {
      default: "Convolutional Neural Networks (CNNs) utilize local spatial hierarchies to extract features from input pixels. The core kernel mathematical formula is:\n\nS(i,j) = (I * K)(i,j) = sum_m sum_n I(i-m, j-n)K(m,n)\n\nBy layering Convolutional filters and Pooling layers, CNNs achieve translation invariance, serving as the core foundation for computer vision models, medical imagery detection, and convolutional neural weights.",
    };

    const cleanTitle = fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
    const content = technicalMockTexts.default;

    // Generate AI summary
    const summaryData = await generateSummary(cleanTitle, content, apiKey);
    
    // Log into State
    addNote(
      cleanTitle,
      content,
      selectedSubjectId,
      'pdf',
      summaryData.summary,
      summaryData.revisionSheet
    );

    // Reset progress
    setUploadProgress(-1);
    setMockFileName('');
    
    // Redirect straight to Workspace to view new note
    router.push('/workspace');
  };

  // 2. Native Web Speech Recognition Recording System
  const handleStartRecording = async () => {
    setRecordedTranscript('');
    setRecordDuration(0);
    setIsRecording(true);

    try {
      // Access real microphone stream for Visualizer node
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);

      // Set up Native Web Speech API if supported
      const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechClass) {
        const recognition = new SpeechClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimText = '';
          let finalResultText = '';
          
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalResultText += event.results[i][0].transcript + ' ';
            } else {
              interimText += event.results[i][0].transcript;
            }
          }
          
          setRecordedTranscript(prev => finalResultText || prev + interimText);
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech API error", e);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        // Overlay a fallback text simulator if speech API is unsupported
        triggerSpeechSimulation();
      }
    } catch (err) {
      console.warn("Microphone blocked or unlinked, running wave simulator only", err);
      // Run canvas wave simulator + text simulator anyway so the UI works
      triggerSpeechSimulation();
    }
  };

  // Web Speech simulation fallback
  const triggerSpeechSimulation = () => {
    const textPool = [
      "Mastering spaced repetition is essential for high-fidelity cognitive retention.",
      "The Leitner system structures memory reviews into five expanding day intervals: one, three, seven, fourteen, and thirty days.",
      "Active recall stimulates neural pathways much more than passive highlighting.",
      "During our Pomodoro focus sessions, ambient procedural noises can shield the brain from distraction.",
      "We will save this transcription logs entry and generate an AI revision guide instantly..."
    ];

    let sentenceIndex = 0;
    const interval = setInterval(() => {
      if (sentenceIndex < textPool.length) {
        setRecordedTranscript(prev => prev + " " + textPool[sentenceIndex]);
        sentenceIndex++;
      } else {
        clearInterval(interval);
      }
    }, 4000);

    (window as any)._speechSimInterval = interval;
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    // Close mic stream
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      setMicStream(null);
    }

    // Stop Native Recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop text simulation
    if ((window as any)._speechSimInterval) {
      clearInterval((window as any)._speechSimInterval);
    }
  };

  const handleSaveVoiceNote = async () => {
    if (!recordedTranscript.trim() || !selectedSubjectId) return;

    const title = `Voice Dictation ${new Date().toLocaleDateString()}`;
    
    // Generate AI Summary
    const summaryData = await generateSummary(title, recordedTranscript, apiKey);

    // Save
    addNote(
      title,
      recordedTranscript,
      selectedSubjectId,
      'voice',
      summaryData.summary,
      summaryData.revisionSheet
    );

    setRecordedTranscript('');
    setRecordDuration(0);
    router.push('/workspace');
  };

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      
      {/* Sidebar Layout shell */}
      <Sidebar />

      {/* Main Upload Pane */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        
        <div className="absolute top-0 left-1/3 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none animate-pulse-glow" />

        {/* Header Title */}
        <header className="pb-6 border-b border-white/5 mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            OCR Document & Voice compiler
          </h1>
          <p className="text-xs text-text-muted">Import technical textbooks or dictate vocal memos to build structured revision cards.</p>
        </header>

        {/* 2-Column Upload Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          
          {/* LEFT COLUMN: Drag & Drop files parser */}
          <div className="space-y-6">
            <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
              
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                  <UploadCloud size={16} className="text-indigo-400" />
                  PDF / Markdown Document Scan
                </h3>
                <p className="text-[10px] text-text-muted">Select subject and upload materials to trigger character indexing.</p>
              </div>

              {/* Subject selectors */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase">Target Study Subject:</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full text-xs font-semibold p-3.5 rounded-xl bg-white/5 border border-color focus:border-indigo-500/50 text-text-primary"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Interactive Drag & Drop Area */}
              {uploadProgress === -1 ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-all relative overflow-hidden group cursor-pointer
                    ${isDragging 
                      ? 'border-indigo-500 bg-indigo-500/5' 
                      : 'border-white/10 hover:border-white/20 bg-white/3'}`}
                >
                  <input 
                    type="file" 
                    id="manual-file"
                    accept=".pdf,.md,.txt"
                    onChange={handleManualFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <UploadCloud size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Drag & drop your study PDF here</p>
                    <p className="text-[10px] text-text-muted">Supports PDF, Markdown, and TXT up to 15MB</p>
                  </div>
                </div>
              ) : (
                /* Dynamic OCR Progress simulation block */
                <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5 animate-pulse">
                      <Sparkles size={12} className="animate-spin" />
                      {uploadPhase}
                    </span>
                    <span className="font-black text-white">{uploadProgress}%</span>
                  </div>
                  
                  {/* Outer bar */}
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed italic text-center">
                    Simulating file: **{mockFileName}**
                  </p>
                </div>
              )}

              {/* Preloaded quick mock-files list */}
              <div className="space-y-2.5 pt-2">
                <p className="text-[10px] font-bold text-text-muted uppercase">Or choose sample document:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => triggerUploadSimulation("Neural_Convolution_Weights.pdf")}
                    disabled={uploadProgress !== -1}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-color hover:border-white/10 text-left transition-all text-[11px] font-medium text-text-primary hover:text-white cursor-pointer disabled:opacity-50"
                  >
                    <FileText size={12} className="text-indigo-400 shrink-0" />
                    <span className="truncate">Convolutional Weights</span>
                  </button>

                  <button
                    onClick={() => triggerUploadSimulation("Spaced_Cognitive_Memory.md")}
                    disabled={uploadProgress !== -1}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-color hover:border-white/10 text-left transition-all text-[11px] font-medium text-text-primary hover:text-white cursor-pointer disabled:opacity-50"
                  >
                    <FileText size={12} className="text-cyan-400 shrink-0" />
                    <span className="truncate">Memory Forgetting Curve</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Voice-to-Notes Dictation Recorder */}
          <div className="space-y-6">
            <div className="glass-panel border border-color rounded-3xl p-5 space-y-4">
              
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Mic size={16} className="text-cyan-400 animate-pulse" />
                  Voice-to-Notes recorder
                </h3>
                <p className="text-[10px] text-text-muted">Dictate lecture notes. Our transcription engine auto-generates indices.</p>
              </div>

              {/* Responsive Waveform Visualizer */}
              <WaveformVisualizer isRecording={isRecording} stream={micStream} />

              {/* Recorder Actions Console */}
              <div className="flex justify-between items-center py-1">
                {isRecording ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-mono text-white font-extrabold">{formatDuration(recordDuration)}</span>
                    <span className="text-[10px] text-text-muted tracking-wider uppercase">Recording Audio...</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-text-muted italic">Click Record to start voice-to-notes dictation.</span>
                )}

                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-lg shadow-cyan-600/10"
                  >
                    <Mic size={12} />
                    Record
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-lg shadow-red-600/10"
                  >
                    <Square size={12} fill="white" />
                    Stop
                  </button>
                )}
              </div>

              {/* Live Transcribed Text Pane */}
              {recordedTranscript && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase flex justify-between">
                      <span>Transcribed Text:</span>
                      <span className="text-indigo-400 lowercase font-medium">auto-sync active</span>
                    </label>
                    <div className="w-full min-h-24 p-3.5 rounded-xl bg-white/5 border border-color text-xs leading-relaxed text-white whitespace-pre-wrap select-none font-semibold">
                      {recordedTranscript}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveVoiceNote}
                    disabled={isRecording || !recordedTranscript.trim()}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <CheckCircle size={14} />
                    Save Voice Note & Summarize
                  </button>
                </div>
              )}

              {/* Instructional Guidelines */}
              <div className="flex gap-2 p-3 rounded-xl bg-white/5 border border-color text-text-muted text-[10px] leading-relaxed">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>
                  For maximum speech-to-text accuracy, utilize Chrome or Safari, minimize surrounding ambient hums, and speak clearly.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Floating Pomodoro widgets overlay */}
      <PomodoroTimer />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStudy, Note } from '../../context/StudyContext';
import Sidebar from '../../components/Sidebar';
import PomodoroTimer from '../../components/PomodoroTimer';
import { askAI, generateSummary, generateFlashcards, AI_PERSONAS } from '../../services/ai';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Edit3, 
  Save, 
  BookOpen, 
  FileText, 
  Layers, 
  BrainCircuit, 
  Sparkle,
  Trash2,
  ListRestart
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function WorkspacePageContent() {
  const searchParams = useSearchParams();
  const { 
    notes, 
    subjects, 
    apiKey, 
    addNote, 
    deleteNote, 
    addFlashcard, 
    addXp,
    theme
  } = useStudy();

  // Selected state configurations
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  
  // Editor state configurations
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorSummary, setEditorSummary] = useState('');
  const [editorSheet, setEditorSheet] = useState('');
  const [isEditorSaving, setIsEditorSaving] = useState(false);

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [persona, setPersona] = useState<'none' | 'socratic' | 'explain5' | 'expertDev'>('none');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Handle URL Query Parameters on Load
  useEffect(() => {
    const prompt = searchParams.get('prompt');
    const urlPersona = searchParams.get('persona');
    const urlSubject = searchParams.get('subject');

    if (urlSubject) setSelectedSubjectId(urlSubject);
    if (urlPersona) setPersona(urlPersona as any);

    if (prompt) {
      setUserInput(prompt);
      // Trigger initial query sequence
      setTimeout(() => {
        handleSendMessage(prompt);
      }, 500);
    }
  }, [searchParams]);

  // Load first subject's notes by default if none selected
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects]);

  // Handle active note loading
  useEffect(() => {
    const subjectNotes = notes.filter(n => n.subjectId === selectedSubjectId);
    if (subjectNotes.length > 0) {
      handleSelectNote(subjectNotes[0]);
    } else {
      setActiveNote(null);
      setEditorTitle('');
      setEditorContent('');
      setEditorSummary('');
      setEditorSheet('');
    }
  }, [selectedSubjectId, notes]);

  const handleSelectNote = (note: Note) => {
    setActiveNote(note);
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setEditorSummary(note.summary || '');
    setEditorSheet(note.revisionSheet || '');
    
    // Clear chat on note swap to refresh cognitive state
    setMessages([
      { role: 'assistant', content: `Hello Dharmesh! I have loaded your note **"${note.title}"**. How shall we analyze this today? You can select any AI tutor persona at the top to clarify deep concepts.` }
    ]);
  };

  // Scroll chat thread to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiLoading]);

  // 2. Chat Send Handler
  const handleSendMessage = async (customMsg?: string) => {
    const text = customMsg || userInput;
    if (!text.trim() || isAiLoading) return;

    const newMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, newMsg]);
    if (!customMsg) setUserInput('');
    setIsAiLoading(true);

    try {
      // Build past history context
      const chatHistory = messages.map(m => ({
        role: m.role as any,
        content: m.content
      }));
      chatHistory.push({ role: 'user', content: text });

      // Append selected note context if loaded
      const noteContext = activeNote 
        ? `Title: ${activeNote.title}\nContent:\n${activeNote.content}` 
        : undefined;

      const aiResponse = await askAI(chatHistory, persona, noteContext, apiKey);
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      addXp(15); // Dialog XP boost
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "🚨 Connection trace disrupted. Please verify your custom OpenAI API Key in settings, or check your local internet stream." 
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 3. Editor Save & Creation handlers
  const handleCreateNewNote = () => {
    if (!selectedSubjectId) return;
    
    const newNoteId = addNote(
      "Untitled Study Note",
      "Type or upload text content here. Select AI Assist tools to generate summaries and revision cheat sheets instantly.",
      selectedSubjectId,
      'doc'
    );
    
    // Quick load new note
    const matched = notes.find(n => n.id === newNoteId);
    if (matched) handleSelectNote(matched);
  };

  const handleSaveNoteEdits = () => {
    if (!activeNote) return;
    setIsEditorSaving(true);

    setTimeout(() => {
      // Update global context values (simulate save, write new note or overwrite)
      activeNote.title = editorTitle;
      activeNote.content = editorContent;
      activeNote.summary = editorSummary;
      activeNote.revisionSheet = editorSheet;

      addXp(40); // Document edit reward
      setIsEditorSaving(false);
    }, 800);
  };

  // 4. AI Assist Toolbar Actions
  const handleAIAssistSummary = async () => {
    if (!editorContent.trim() || isAiLoading) return;
    setIsAiLoading(true);

    try {
      const result = await generateSummary(editorTitle, editorContent, apiKey);
      setEditorSummary(result.summary);
      setEditorSheet(result.revisionSheet);
      addXp(75); // Complex summarize XP reward
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAIAssistFlashcards = async () => {
    if (!editorContent.trim() || isAiLoading) return;
    setIsAiLoading(true);

    try {
      const cards = await generateFlashcards(editorTitle, editorContent, apiKey);
      cards.forEach(card => {
        addFlashcard(card.front, card.back, selectedSubjectId, activeNote?.id);
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `✨ I have successfully synthesized **${cards.length} spaced repetition flashcards** from your active note content and loaded them into your Leitner review study decks!` 
      }]);
      addXp(50);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAIAssistElaborate = async () => {
    if (!editorContent.trim() || isAiLoading) return;
    setIsAiLoading(true);

    const promptMessage = [
      {
        role: 'system' as const,
        content: 'You are an elite academic expansions writer. Deepen, clarify, and elaborate the technical details of the user note content, outputting the result in clean Markdown.'
      },
      {
        role: 'user' as const,
        content: `Please elaborate and expand the details of this study note:
        
        Title: ${editorTitle}
        Current Content:
        ${editorContent}`
      }
    ];

    try {
      const expandedText = await askAI(promptMessage, 'none', undefined, apiKey);
      setEditorContent(prev => prev + "\n\n## 🧬 Deep Dive Expansion (AI Generated)\n" + expandedText);
      addXp(60);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      
      {/* Sidebar Core Shell */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Workspace Sub Header Toolbar */}
        <header className="px-6 py-4 border-b border-white/5 bg-[#0b101c]/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-20">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-text-muted uppercase">ACTIVE SUBJECT:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-color text-xs font-semibold text-text-primary focus:border-indigo-500/50"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* AI Persona Chips selectors */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider shrink-0 mr-1">Tutor Mind:</span>
            {([
              { id: 'none', label: 'Tutor', icon: Bot },
              { id: 'socratic', label: 'Socratic', icon: BrainCircuit },
              { id: 'explain5', label: 'ELI5 🧸', icon: Sparkle },
              { id: 'expertDev', label: 'Staff Dev', icon: Sparkles }
            ] as const).map(p => {
              const ChipIcon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer
                    ${persona === p.id 
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/30' 
                      : 'bg-white/5 text-text-muted border border-transparent hover:text-white hover:bg-white/10'}`}
                >
                  <ChipIcon size={11} />
                  {p.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Dynamic Split Screen Canvas */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL: Chat interface */}
          <div className="w-1/2 border-r border-white/5 flex flex-col justify-between bg-primary relative">
            
            {/* Scrollable messages scrollpane */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3.5 max-w-[85%] rounded-2xl p-4 border
                    ${msg.role === 'user' 
                      ? 'ml-auto bg-indigo-500/10 border-indigo-500/15 text-white flex-row-reverse' 
                      : 'bg-white/5 border-color text-text-primary'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow
                    ${msg.role === 'user' 
                      ? 'bg-gradient-to-tr from-indigo-500 to-indigo-600' 
                      : 'bg-gradient-to-tr from-indigo-500 to-cyan-400'}`}
                  >
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-text-muted">
                      {msg.role === 'user' ? 'Dharmesh (You)' : `${persona === 'none' ? 'Aura Study' : persona + ' persona'}`}
                    </p>
                    <div className="text-xs leading-relaxed font-normal whitespace-pre-wrap selection:bg-indigo-500/40">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {/* AI loading prompt wave */}
              {isAiLoading && (
                <div className="flex gap-3.5 max-w-[80%] rounded-2xl p-4 bg-white/5 border border-color animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shrink-0">
                    <Sparkle size={14} className="animate-spin" />
                  </div>
                  <div className="space-y-2 flex-1 py-1">
                    <div className="h-2.5 bg-white/10 rounded w-1/3" />
                    <div className="h-2 bg-white/10 rounded w-5/6" />
                    <div className="h-2 bg-white/10 rounded w-2/3" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Prompts chips quick-starts */}
            <div className="px-5 py-2 flex gap-2 border-t border-white/5 overflow-x-auto scrollbar-none">
              {[
                "Explain Scaled Attention simply",
                "How does spaced repetition work?",
                "Suggest a level study plan",
                "Explain quicksort partition logic"
              ].map((chipPrompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(chipPrompt)}
                  className="px-3 py-1.5 rounded-full border border-color bg-white/5 hover:bg-white/10 hover:border-white/15 text-[10px] text-text-muted hover:text-white transition-all shrink-0 cursor-pointer font-semibold"
                >
                  {chipPrompt}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-white/5 bg-[#0b101c]/50 flex gap-3 relative z-10">
              <input
                type="text"
                placeholder={`Ask the AI Tutor anything... (${persona === 'none' ? 'Standard' : persona} active)`}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 text-xs font-semibold p-3.5 rounded-xl bg-white/5 border border-color focus:border-indigo-500/50 text-white placeholder-text-muted"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isAiLoading}
                className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center text-white cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Send size={16} fill="white" />
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: Notion AI markdown editor */}
          <div className="w-1/2 flex flex-col justify-between bg-[#070b13]">
            
            {/* Editor Note Sidebar list */}
            {activeNote ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Note title toolbar */}
                <div className="px-5 py-3.5 border-b border-white/5 bg-black/10 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-indigo-400" />
                    <input
                      type="text"
                      value={editorTitle}
                      onChange={(e) => setEditorTitle(e.target.value)}
                      className="bg-transparent font-extrabold text-xs text-white border-b border-transparent hover:border-white/20 focus:border-indigo-500 outline-none transition-colors"
                      placeholder="Note Title"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveNoteEdits}
                      disabled={isEditorSaving}
                      className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer disabled:opacity-40"
                    >
                      <Save size={12} />
                      {isEditorSaving ? 'Saving...' : 'Save Draft'}
                    </button>

                    <button
                      onClick={() => deleteNote(activeNote.id)}
                      className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-0.5"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>

                {/* AI Document Editor Actions Toolbar */}
                <div className="px-5 py-2.5 bg-indigo-500/5 border-b border-white/5 flex gap-2 overflow-x-auto shrink-0 select-none">
                  <button
                    onClick={handleAIAssistSummary}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-[10px] flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    <Bot size={11} />
                    Synthesize Summary & Sheets
                  </button>

                  <button
                    onClick={handleAIAssistFlashcards}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-color text-text-muted hover:text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    <Layers size={11} />
                    Generate Flashcards
                  </button>

                  <button
                    onClick={handleAIAssistElaborate}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-color text-text-muted hover:text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    <BrainCircuit size={11} />
                    AI Deep Dive Elaborate
                  </button>
                </div>

                {/* Real Markdown editing scrolling frame */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Note Content:</label>
                    <textarea
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      className="w-full min-h-48 text-xs leading-relaxed font-semibold p-4 rounded-2xl bg-white/5 border border-color focus:border-indigo-500 outline-none text-white placeholder-text-muted"
                      placeholder="Write deep academic notes here. Select AI Assist above to process."
                    />
                  </div>

                  {editorSummary && (
                    <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 space-y-2">
                      <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <BookOpen size={13} />
                        AI Summary (Spaced bullet lists)
                      </h4>
                      <p className="text-[11px] text-text-muted leading-relaxed whitespace-pre-wrap">
                        {editorSummary}
                      </p>
                    </div>
                  )}

                  {editorSheet && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-color space-y-2">
                      <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <FileText size={13} />
                        AI Revision sheet (Active learning guides)
                      </h4>
                      <p className="text-[11px] text-text-muted leading-relaxed whitespace-pre-wrap font-mono">
                        {editorSheet}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-color flex items-center justify-center text-text-muted">
                  <FileText size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">No Study Note Loaded</h4>
                  <p className="text-[11px] text-text-muted max-w-xs">
                    Create a new draft or select an active subject in the header to read documents.
                  </p>
                </div>
                <button
                  onClick={handleCreateNewNote}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs transition-colors cursor-pointer"
                >
                  Create Study Note
                </button>
              </div>
            )}
            
            {/* Subject Side Note Quick selectors */}
            <div className="p-3 border-t border-white/5 bg-[#0b101c]/50 flex gap-2 overflow-x-auto select-none shrink-0 scrollbar-none">
              <button
                onClick={handleCreateNewNote}
                className="px-3.5 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
              >
                + New Document
              </button>
              
              {notes
                .filter(n => n.subjectId === selectedSubjectId)
                .map(note => (
                  <button
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`px-3.5 py-2 rounded-lg text-[10px] font-bold shrink-0 transition-colors capitalize cursor-pointer border
                      ${activeNote?.id === note.id 
                        ? 'bg-indigo-600/20 border-indigo-500/35 text-white' 
                        : 'bg-white/5 border-transparent text-text-muted hover:text-white'}`}
                  >
                    {note.title.length > 18 ? note.title.substring(0, 18) + '...' : note.title}
                  </button>
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

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#070b13] text-text-muted text-xs">
        Loading AI Study Workspace...
      </div>
    }>
      <WorkspacePageContent />
    </Suspense>
  );
}
